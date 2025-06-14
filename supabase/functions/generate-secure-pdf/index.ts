
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import 'https://deno.land/x/xhr@0.1.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { budgetData, userId, timestamp, fingerprint } = await req.json();

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verificar licença do usuário
    const { data: license, error: licenseError } = await supabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (licenseError || !license || license.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Licença inválida ou expirada' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar limite de PDFs
    if (license.pdfs_generated >= license.pdf_limit) {
      return new Response(
        JSON.stringify({ error: 'Limite de PDFs atingido' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar PDF completo
    const pdfContent = await generateCompletePDF(budgetData, userId, fingerprint);

    // Registrar geração
    await supabase.from('pdf_generations').insert({
      user_id: userId,
      client_name: budgetData.clientInfo.name,
      total_value: budgetData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0),
      fingerprint: fingerprint,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    // Incrementar contador
    await supabase.rpc('increment_pdf_count', { user_id: userId });

    return new Response(
      JSON.stringify({ pdf: pdfContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateCompletePDF(budgetData: any, userId: string, fingerprint: string): Promise<string> {
  try {
    // Calcular totais
    const subtotal = budgetData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const desconto = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - desconto;

    // Watermark de segurança
    const watermark = `ID: ${userId.slice(-8)} | FP: ${fingerprint} | ${new Date().toISOString()}`;
    
    // Gerar PDF básico mas funcional
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 800
>>
stream
BT
/F1 16 Tf
50 750 Td
(ORCAMENTO) Tj
0 -30 Td
/F1 12 Tf
(Empresa: ${budgetData.companyInfo.name || 'N/A'}) Tj
0 -20 Td
(Cliente: ${budgetData.clientInfo.name || 'N/A'}) Tj
0 -20 Td
(Email: ${budgetData.clientInfo.email || 'N/A'}) Tj
0 -30 Td
(ITENS:) Tj
0 -20 Td
(Qtd  Descricao                    Preco Unit.  Total) Tj
0 -15 Td
(${budgetData.items.map((item: any, index: number) => 
  `${item.quantity}   ${item.description.substring(0, 20)}${item.description.length > 20 ? '...' : ''}   R$ ${item.unitPrice.toFixed(2)}   R$ ${item.total.toFixed(2)}`
).join('\n')}) Tj
0 -40 Td
(Subtotal: R$ ${subtotal.toFixed(2)}) Tj
0 -15 Td
(Desconto: R$ ${desconto.toFixed(2)}) Tj
0 -15 Td
/F1 14 Tf
(TOTAL: R$ ${total.toFixed(2)}) Tj
0 -30 Td
/F1 10 Tf
(Validade: ${budgetData.validityDays || 30} dias) Tj
0 -20 Td
(${budgetData.specialConditions || 'Sem condicoes especiais'}) Tj
0 -40 Td
/F1 8 Tf
(${watermark}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000273 00000 n 
0000001125 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
1203
%%EOF`;

    // Converter para base64 corretamente
    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfContent);
    
    // Usar btoa corretamente
    let base64String = '';
    const chunk = 1024;
    for (let i = 0; i < pdfBytes.length; i += chunk) {
      const chunkBytes = pdfBytes.slice(i, i + chunk);
      base64String += btoa(String.fromCharCode(...chunkBytes));
    }
    
    return base64String;
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha na geração do PDF');
  }
}
