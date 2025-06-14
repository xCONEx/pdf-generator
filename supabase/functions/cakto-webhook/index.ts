
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Validar webhook (implementar validação de assinatura da Cakto)
    const isValid = await validateCaktoWebhook(webhookData, req.headers);
    
    if (!isValid) {
      return new Response('Invalid webhook', { status: 401 });
    }

    // Mapear dados da Cakto para nosso formato
    const purchaseData = mapCaktoData(webhookData);

    // Inserir compra na tabela
    const { data, error } = await supabase
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir compra:', error);
      return new Response('Database error', { status: 500 });
    }

    console.log('Compra registrada:', data);

    return new Response(
      JSON.stringify({ success: true, purchase_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

async function validateCaktoWebhook(data: any, headers: Headers): Promise<boolean> {
  // Implementar validação de assinatura específica da Cakto
  // Por enquanto, validação básica
  return !!(data.email && data.product_name && data.status);
}

function mapCaktoData(webhookData: any) {
  // Mapear campos da Cakto para nosso formato
  let plan = 'basic';
  
  // Detectar plano baseado no nome do produto
  if (webhookData.product_name?.toLowerCase().includes('premium')) {
    plan = 'premium';
  }

  return {
    email: webhookData.email || webhookData.customer_email,
    product_name: webhookData.product_name,
    plan: plan,
    amount: parseFloat(webhookData.amount || webhookData.value || '0'),
    payment_status: webhookData.status || webhookData.payment_status,
    external_id: webhookData.transaction_id || webhookData.id,
    webhook_data: webhookData,
    processed: false,
  };
}
