
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAKTO_WEBHOOK_KEY = '08f50a3f-44c8-444d-98ad-3e8cd2e94957';
const ADMIN_EMAIL = 'adm.financeflow@gmail.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const webhookData = await req.json();
    console.log('Webhook recebido da Cakto:', webhookData);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validar webhook da Cakto
    const isValid = await validateCaktoWebhook(webhookData, req.headers);
    
    if (!isValid) {
      console.error('Webhook inválido da Cakto');
      return new Response('Invalid webhook', { status: 401 });
    }

    // Mapear dados da Cakto para nosso formato
    const purchaseData = mapCaktoData(webhookData);

    // Inserir compra na tabela
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single();

    if (purchaseError) {
      console.error('Erro ao inserir compra:', purchaseError);
      return new Response('Database error', { status: 500 });
    }

    console.log('Compra registrada:', purchase);

    // Se o pagamento foi aprovado, criar/atualizar licença do usuário
    if (webhookData.status === 'approved' || webhookData.status === 'paid') {
      await createOrUpdateUserLicense(supabase, purchaseData);
    }

    // Notificar admin por email (opcional - pode implementar depois)
    await notifyAdmin(supabase, purchaseData);

    return new Response(
      JSON.stringify({ success: true, purchase_id: purchase.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

async function validateCaktoWebhook(data: any, headers: Headers): Promise<boolean> {
  // Validar com a chave específica da Cakto
  const authHeader = headers.get('authorization') || headers.get('x-webhook-key');
  
  // Verificar se a chave está presente no header ou no body
  if (authHeader === CAKTO_WEBHOOK_KEY || data.webhook_key === CAKTO_WEBHOOK_KEY) {
    return true;
  }

  // Validação básica dos campos obrigatórios
  return !!(data.email && data.product_name && data.status);
}

function mapCaktoData(webhookData: any) {
  // Mapear campos da Cakto para nosso formato
  let plan = 'basic';
  
  // Detectar plano baseado no nome do produto
  const productName = (webhookData.product_name || '').toLowerCase();
  if (productName.includes('premium') || productName.includes('pro')) {
    plan = 'premium';
  }

  return {
    email: webhookData.email || webhookData.customer_email || webhookData.buyer_email,
    product_name: webhookData.product_name || webhookData.name,
    plan: plan,
    amount: parseFloat(webhookData.amount || webhookData.value || webhookData.price || '0'),
    payment_status: webhookData.status || webhookData.payment_status,
    external_id: webhookData.transaction_id || webhookData.id || webhookData.order_id,
    webhook_data: webhookData,
    processed: false,
  };
}

async function createOrUpdateUserLicense(supabase: any, purchaseData: any) {
  try {
    // Buscar ou criar usuário
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(purchaseData.email);
    
    let userId = user?.id;
    
    // Se usuário não existe, criar um registro temporário
    if (!userId) {
      console.log('Usuário não encontrado, criando licença pendente para:', purchaseData.email);
    }

    // Calcular data de expiração (1 ano a partir de agora)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Determinar limite de PDFs baseado no plano
    const pdfLimit = purchaseData.plan === 'premium' ? 1000 : 100;

    const licenseData = {
      user_id: userId,
      email: purchaseData.email, // Para casos onde o usuário ainda não existe
      plan: purchaseData.plan,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      pdfs_generated: 0,
      pdf_limit: pdfLimit,
      purchase_id: purchaseData.external_id,
    };

    // Inserir ou atualizar licença
    const { data: license, error: licenseError } = await supabase
      .from('user_licenses')
      .upsert(licenseData, { 
        onConflict: userId ? 'user_id' : 'email'
      })
      .select()
      .single();

    if (licenseError) {
      console.error('Erro ao criar/atualizar licença:', licenseError);
    } else {
      console.log('Licença criada/atualizada:', license);
    }

  } catch (error) {
    console.error('Erro ao processar licença:', error);
  }
}

async function notifyAdmin(supabase: any, purchaseData: any) {
  // Registrar notificação para o admin
  try {
    await supabase.from('admin_notifications').insert({
      type: 'new_purchase',
      message: `Nova compra: ${purchaseData.email} - ${purchaseData.plan} - R$ ${purchaseData.amount}`,
      data: purchaseData,
      admin_email: ADMIN_EMAIL,
    });
  } catch (error) {
    console.error('Erro ao notificar admin:', error);
  }
}
