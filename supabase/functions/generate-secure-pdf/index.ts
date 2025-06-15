

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import 'https://deno.land/x/xhr@0.1.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { budgetData, userId, timestamp, fingerprint } = await req.json();

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

    if (license.pdfs_generated >= license.pdf_limit) {
      return new Response(
        JSON.stringify({ error: 'Limite de PDFs atingido' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Gerando PDF seguro para:', budgetData.clientInfo.name);

    const pdfContent = await generateSecurePDF(budgetData, userId, fingerprint);

    await supabase.from('pdf_generations').insert({
      user_id: userId,
      client_name: budgetData.clientInfo.name,
      total_value: budgetData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0),
      fingerprint: fingerprint,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

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

async function generateSecurePDF(budgetData: any, userId: string, fingerprint: string): Promise<string> {
  try {
    console.log('Iniciando geração do PDF seguro...');
    
    // Mapeamento das cores dos temas
    const COLOR_THEMES = {
      blue: { r: 0.16, g: 0.50, b: 0.73 },
      green: { r: 0.09, g: 0.63, b: 0.52 },
      purple: { r: 0.56, g: 0.27, b: 0.68 },
      red: { r: 0.91, g: 0.30, b: 0.24 },
      orange: { r: 0.90, g: 0.49, b: 0.13 }
    };
    
    // Usar a cor do tema selecionado ou azul como padrão
    const selectedColor = COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.blue;
    
    console.log('Usando cor do tema:', budgetData.colorTheme, selectedColor);
    
    const subtotal = budgetData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const desconto = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - desconto;
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const watermark = `ID: ${userId.slice(-8)} | FP: ${fingerprint} | ${new Date().toISOString()}`;
    
    // Melhorar formatação dos itens
    const itemsContent = budgetData.items.map((item: any, index: number) => {
      const description = item.description.length > 20 ? item.description.substring(0, 20) + '...' : item.description;
      return `${(index + 1).toString().padEnd(2)} ${description.padEnd(25)} ${item.quantity.toString().padEnd(3)} R$ ${item.unitPrice.toFixed(2).padStart(8)} R$ ${item.total.toFixed(2).padStart(10)}`;
    }).join('\n');

    // Truncar textos longos para evitar problemas
    const companyName = budgetData.companyInfo.name.substring(0, 40);
    const companyEmail = budgetData.companyInfo.email.substring(0, 40);
    const companyPhone = budgetData.companyInfo.phone.substring(0, 25);
    const companyAddress = (budgetData.companyInfo.address || '').substring(0, 40);

    const clientName = budgetData.clientInfo.name.substring(0, 40);
    const clientEmail = budgetData.clientInfo.email.substring(0, 40);
    const clientPhone = budgetData.clientInfo.phone.substring(0, 25);
    const clientAddress = (budgetData.clientInfo.address || '').substring(0, 40);

    const specialConditions = (budgetData.specialConditions || '').substring(0, 50);
    const observations = (budgetData.observations || '').substring(0, 50);

    const contentLength = 2200 + itemsContent.length + companyName.length + clientName.length + specialConditions.length + observations.length;

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
/Length ${contentLength}
>>
stream
q
${selectedColor.r} ${selectedColor.g} ${selectedColor.b} rg
0 760 612 32 re
f
Q

BT
1 1 1 rg
/F1 20 Tf
20 775 Td
(ORCAMENTO PROFISSIONAL - ${budgetNumber}) Tj
0 -10 Td
/F2 10 Tf
(Data: ${new Date().toLocaleDateString('pt-BR')}) Tj
ET

q
${selectedColor.r} ${selectedColor.g} ${selectedColor.b} rg
20 715 572 15 re
f
Q

BT
1 1 1 rg
/F1 12 Tf
25 723 Td
(DADOS DA EMPRESA) Tj
0 0 0 rg
/F2 10 Tf
0 -20 Td
(${companyName}) Tj
0 -12 Td
(Email: ${companyEmail}) Tj
0 -12 Td
(Telefone: ${companyPhone}) Tj
0 -12 Td
(Endereco: ${companyAddress}) Tj
ET

q
${selectedColor.r} ${selectedColor.g} ${selectedColor.b} rg
20 615 572 15 re
f
Q

BT
1 1 1 rg
/F1 12 Tf
25 623 Td
(DADOS DO CLIENTE) Tj
0 0 0 rg
/F2 10 Tf
0 -20 Td
(${clientName}) Tj
0 -12 Td
(Email: ${clientEmail}) Tj
0 -12 Td
(Telefone: ${clientPhone}) Tj
0 -12 Td
(Endereco: ${clientAddress}) Tj
ET

q
${selectedColor.r} ${selectedColor.g} ${selectedColor.b} rg
20 515 572 15 re
f
Q

BT
1 1 1 rg
/F1 12 Tf
25 523 Td
(ITENS DO ORCAMENTO) Tj
0 0 0 rg
/F2 9 Tf
0 -20 Td
(Item Descricao               Qtd  Preco Unit.    Total) Tj
0 -15 Td
(${itemsContent}) Tj
0 -30 Td

/F1 11 Tf
400 0 Td
(Subtotal: R$ ${subtotal.toFixed(2)}) Tj
0 -15 Td
(Desconto: R$ ${desconto.toFixed(2)}) Tj
0 -15 Td
${selectedColor.r} ${selectedColor.g} ${selectedColor.b} rg
/F1 14 Tf
(TOTAL: R$ ${total.toFixed(2)}) Tj
0 0 0 rg
-400 -35 Td

/F2 9 Tf
(Validade: ${budgetData.validityDays || 30} dias) Tj
0 -12 Td
(Condicoes: ${specialConditions}) Tj
0 -12 Td
(Observacoes: ${observations}) Tj
ET

q
${selectedColor.r} ${selectedColor.g} ${selectedColor.b} rg
20 120 572 30 re
f
Q

BT
1 1 1 rg
/F1 14 Tf
25 138 Td
(ACEITA NOSSO ORCAMENTO?) Tj
/F2 10 Tf
0 -12 Td
(Entre em contato conosco para finalizar!) Tj
0 0 0 rg
0 -25 Td

/F2 7 Tf
0.5 0.5 0.5 rg
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
0000002400 00000 n 
0000002468 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
2531
%%EOF`;

    console.log('PDF gerado com sucesso');

    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfTemplate);
    const base64String = btoa(String.fromCharCode(...pdfBytes));
    
    console.log('Base64 criado, tamanho:', base64String.length);
    
    return base64String;
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(`Falha na geração do PDF: ${error.message}`);
  }
}

