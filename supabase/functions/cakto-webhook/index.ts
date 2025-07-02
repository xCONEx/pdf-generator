import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Garantir que as variáveis de ambiente estejam disponíveis
if (typeof Deno !== 'undefined' && Deno.env) {
  // Deno.env já está disponível
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAKTO_WEBHOOK_KEY = Deno.env.get('CAKTO_WEBHOOK_KEY') ?? '';
const ADMIN_EMAILS = ['adm.financeflow@gmail.com', 'yuriadrskt@gmail.com'];

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
      console.warn('Webhook inválido da Cakto');
      return new Response('Invalid webhook', { status: 401 });
    }

    // Controle de idempotência: checar se já existe compra com o mesmo external_id
    const { data: existingPurchase, error: existingPurchaseError } = await supabase
      .from('purchases')
      .select('id')
      .eq('external_id', webhookData.transaction_id || webhookData.id || webhookData.order_id)
      .maybeSingle();

    if (existingPurchase) {
      console.warn('Compra já registrada para este external_id:', webhookData.transaction_id || webhookData.id || webhookData.order_id);
      return new Response(
        JSON.stringify({ success: true, message: 'Compra já registrada', purchase_id: existingPurchase.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      console.warn('Erro ao inserir compra:', purchaseError);
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
    console.warn('Erro no webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

async function validateCaktoWebhook(data: any, headers: Headers): Promise<boolean> {
  // Validar com a chave específica da Cakto - apenas no header
  const authHeader = headers.get('authorization') || headers.get('x-webhook-key');
  
  // Verificar se a chave está presente APENAS no header (mais seguro)
  if (authHeader !== CAKTO_WEBHOOK_KEY) {
    console.warn('Chave de webhook inválida ou ausente');
    return false;
  }

  // Validação rigorosa dos campos obrigatórios
  const requiredFields = ['email', 'product_name', 'status'];
  for (const field of requiredFields) {
    if (!data[field]) {
      console.warn(`Campo obrigatório ausente: ${field}`);
      return false;
    }
  }

  // Validar status de pagamento
  const validStatuses = ['approved', 'paid', 'pending', 'cancelled', 'refunded'];
  if (!validStatuses.includes(data.status)) {
    console.warn(`Status de pagamento inválido: ${data.status}`);
    return false;
  }

  return true;
}

function mapCaktoData(webhookData: any) {
  // Mapear campos da Cakto para nosso formato com lógica mais robusta
  let plan = 'basic';
  
  // Detectar plano baseado no nome do produto com lógica mais precisa
  const productName = (webhookData.product_name || '').toLowerCase();
  const productId = (webhookData.product_id || '').toLowerCase();
  
  // Mapeamento mais específico
  if (productName.includes('enterprise') || productId.includes('enterprise')) {
    plan = 'enterprise';
  } else if (productName.includes('premium') || productName.includes('pro') || 
             productId.includes('premium') || productId.includes('pro')) {
    plan = 'premium';
  } else if (productName.includes('basic') || productName.includes('starter') ||
             productId.includes('basic') || productId.includes('starter')) {
    plan = 'basic';
  }

  // Log para debug
  console.log(`Mapeamento de plano: "${productName}" -> ${plan}`);

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

    // Determinar limite de PDFs baseado no plano com valores mais realistas
    let pdfLimit: number;
    switch (purchaseData.plan) {
      case 'enterprise':
        pdfLimit = 999999; // Ilimitado para enterprise
        break;
      case 'premium':
        pdfLimit = 1000; // 1000 PDFs para premium
        break;
      case 'basic':
      default:
        pdfLimit = 100; // 100 PDFs para basic
        break;
    }

    console.log(`Criando licença ${purchaseData.plan} com limite de ${pdfLimit} PDFs`);

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
      console.warn('Erro ao criar/atualizar licença:', licenseError);
    } else {
      console.log('Licença criada/atualizada:', license);
    }

  } catch (error) {
    console.warn('Erro ao processar licença:', error);
  }
}

async function notifyAdmin(supabase: any, purchaseData: any) {
  // Registrar notificação para todos os admins
  try {
    const notifications = ADMIN_EMAILS.map(email => ({
      type: 'new_purchase',
      message: `Nova compra: ${purchaseData.email} - ${purchaseData.plan} - R$ ${purchaseData.amount}`,
      data: purchaseData,
      admin_email: email,
    }));
    await supabase.from('admin_notifications').insert(notifications);
  } catch (error) {
    console.warn('Erro ao notificar admin:', error);
  }
}
