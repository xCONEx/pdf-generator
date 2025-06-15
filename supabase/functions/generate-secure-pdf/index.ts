
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

    console.log('Gerando PDF para:', budgetData.clientInfo.name);

    // Gerar PDF completo
    const pdfContent = await generateCompletePDF(budgetData, userId, fingerprint);

    console.log('PDF gerado, tamanho:', pdfContent.length);

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
    console.log('Iniciando geração do PDF...');
    
    // Calcular totais
    const subtotal = budgetData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const desconto = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - desconto;

    // Watermark de segurança
    const watermark = `ID: ${userId.slice(-8)} | FP: ${fingerprint} | ${new Date().toISOString()}`;
    
    // Criar conteúdo dos itens
    const itemsContent = budgetData.items.map((item: any, index: number) => {
      const desc = item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description;
      return `${item.quantity.toString().padEnd(4)} ${desc.padEnd(30)} R$ ${item.unitPrice.toFixed(2).padStart(10)} R$ ${item.total.toFixed(2).padStart(12)}`;
    }).join('\n');

    // Template PDF mais robusto
    const pdfTemplate = `%PDF-1.4
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
/F2 6 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${1200 + itemsContent.length}
>>
stream
BT
/F1 20 Tf
50 750 Td
(ORCAMENTO) Tj
0 -40 Td

/F1 14 Tf
(EMPRESA:) Tj
0 -20 Td
/F2 12 Tf
(${(budgetData.companyInfo.name || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(${(budgetData.companyInfo.email || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(${(budgetData.companyInfo.phone || 'N/A').substring(0, 30)}) Tj
0 -25 Td

/F1 14 Tf
(CLIENTE:) Tj
0 -20 Td
/F2 12 Tf
(${(budgetData.clientInfo.name || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(${(budgetData.clientInfo.email || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(${(budgetData.clientInfo.phone || 'N/A').substring(0, 30)}) Tj
0 -30 Td

/F1 14 Tf
(ITENS DO ORCAMENTO:) Tj
0 -25 Td
/F2 10 Tf
(Qtd  Descricao                    Preco Unit.      Total) Tj
0 -15 Td
(${itemsContent}) Tj
0 -30 Td

/F1 12 Tf
(Subtotal: R$ ${subtotal.toFixed(2)}) Tj
0 -18 Td
(Desconto: R$ ${desconto.toFixed(2)}) Tj
0 -18 Td
/F1 16 Tf
(TOTAL FINAL: R$ ${total.toFixed(2)}) Tj
0 -35 Td

/F2 10 Tf
(Validade: ${budgetData.validityDays || 30} dias) Tj
0 -20 Td
(${(budgetData.specialConditions || 'Sem condicoes especiais').substring(0, 80)}) Tj
0 -25 Td
(${(budgetData.observations || '').substring(0, 80)}) Tj
0 -35 Td

/F2 8 Tf
(${watermark}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000273 00000 n 
0000001400 00000 n 
0000001468 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
1531
%%EOF`;

    console.log('PDF template criado, convertendo para base64...');

    // Converter para bytes usando TextEncoder
    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfTemplate);
    
    console.log('PDF bytes criados:', pdfBytes.length);

    // Converter para base64 de forma segura
    const base64Chunks: string[] = [];
    const chunkSize = 3000; // Tamanho do chunk menor para evitar problemas
    
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.slice(i, i + chunkSize);
      const chunkString = String.fromCharCode(...chunk);
      base64Chunks.push(btoa(chunkString));
    }
    
    const base64String = base64Chunks.join('');
    
    console.log('Base64 gerado, tamanho:', base64String.length);
    
    // Validar se o base64 é válido
    try {
      // Testar se conseguimos decodificar
      const testDecode = atob(base64String.substring(0, 100));
      console.log('Base64 válido, teste de decode ok');
    } catch (testError) {
      console.error('Base64 inválido:', testError);
      throw new Error('Base64 gerado é inválido');
    }
    
    return base64String;
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(`Falha na geração do PDF: ${error.message}`);
  }
}
