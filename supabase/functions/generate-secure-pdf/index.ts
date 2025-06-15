
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import 'https://deno.land/x/xhr@0.1.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const COLOR_THEMES = {
  blue: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#DBEAFE' },
  green: { primary: '#10B981', secondary: '#047857', accent: '#D1FAE5' },
  orange: { primary: '#F59E0B', secondary: '#D97706', accent: '#FEF3C7' },
  purple: { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#EDE9FE' },
  red: { primary: '#EF4444', secondary: '#DC2626', accent: '#FEE2E2' }
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

    console.log('Gerando PDF com cores para:', budgetData.clientInfo.name);

    const pdfContent = await generateCompletePDF(budgetData, userId, fingerprint);

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

async function generateCompletePDF(budgetData: any, userId: string, fingerprint: string): Promise<string> {
  try {
    console.log('Iniciando geração do PDF com cores...');
    
    // Selecionar tema de cores
    const selectedTheme = budgetData.colorTheme || 'blue';
    const theme = COLOR_THEMES[selectedTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.blue;
    
    console.log('Tema selecionado:', selectedTheme, theme);
    
    // Converter hex para RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 0.23, g: 0.51, b: 0.96 }; // fallback para azul
    };
    
    const primaryRgb = hexToRgb(theme.primary);
    const accentRgb = hexToRgb(theme.accent);
    
    console.log('Cores RGB:', { primary: primaryRgb, accent: accentRgb });
    
    const subtotal = budgetData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    const desconto = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - desconto;

    const watermark = `ID: ${userId.slice(-8)} | FP: ${fingerprint} | ${new Date().toISOString()}`;
    
    const itemsContent = budgetData.items.map((item: any) => {
      const desc = item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description;
      return `${item.quantity.toString().padEnd(4)} ${desc.padEnd(30)} R$ ${item.unitPrice.toFixed(2).padStart(10)} R$ ${item.total.toFixed(2).padStart(12)}`;
    }).join('\n');

    // Template PDF com cores aplicadas
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
/ColorSpace <<
/CS1 7 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${1500 + itemsContent.length}
>>
stream
q
${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b} rg
0 765 612 27 re
f
Q

BT
1 1 1 rg
/F1 20 Tf
50 775 Td
(ORCAMENTO PROFISSIONAL) Tj
0 -15 Td
/F2 12 Tf
(${(budgetData.companyInfo.name || 'N/A').substring(0, 50)}) Tj
ET

q
${accentRgb.r} ${accentRgb.g} ${accentRgb.b} rg
50 720 512 20 re
f
Q

BT
${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b} rg
/F1 14 Tf
55 728 Td
(DADOS DA EMPRESA) Tj
0 0 0 rg
/F2 12 Tf
0 -25 Td
(Empresa: ${(budgetData.companyInfo.name || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(Email: ${(budgetData.companyInfo.email || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(Telefone: ${(budgetData.companyInfo.phone || 'N/A').substring(0, 30)}) Tj
0 -15 Td
(Endereco: ${(budgetData.companyInfo.address || 'N/A').substring(0, 50)}) Tj
ET

q
${accentRgb.r} ${accentRgb.g} ${accentRgb.b} rg
50 630 512 20 re
f
Q

BT
${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b} rg
/F1 14 Tf
55 638 Td
(DADOS DO CLIENTE) Tj
0 0 0 rg
/F2 12 Tf
0 -25 Td
(Cliente: ${(budgetData.clientInfo.name || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(Email: ${(budgetData.clientInfo.email || 'N/A').substring(0, 50)}) Tj
0 -15 Td
(Telefone: ${(budgetData.clientInfo.phone || 'N/A').substring(0, 30)}) Tj
0 -15 Td
(Endereco: ${(budgetData.clientInfo.address || 'N/A').substring(0, 50)}) Tj
ET

q
${accentRgb.r} ${accentRgb.g} ${accentRgb.b} rg
50 520 512 20 re
f
Q

BT
${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b} rg
/F1 14 Tf
55 528 Td
(DETALHAMENTO DOS SERVICOS) Tj
0 0 0 rg
/F2 10 Tf
0 -25 Td
(Qtd  Descricao                    Preco Unit.      Total) Tj
0 -15 Td
(${itemsContent}) Tj
0 -30 Td

q
${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b} RG
2 w
405 0 157 80 re
S
Q

/F1 12 Tf
410 70 Td
(Subtotal: R$ ${subtotal.toFixed(2)}) Tj
0 -18 Td
(Desconto: R$ ${desconto.toFixed(2)}) Tj
0 -18 Td
${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b} rg
/F1 16 Tf
(TOTAL: R$ ${total.toFixed(2)}) Tj
0 0 0 rg
0 -35 Td

/F2 10 Tf
(Validade: ${budgetData.validityDays || 30} dias) Tj
0 -20 Td
(${(budgetData.specialConditions || 'Sem condicoes especiais').substring(0, 80)}) Tj
0 -25 Td
(${(budgetData.observations || '').substring(0, 80)}) Tj
ET

q
${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b} rg
50 150 512 40 re
f
Q

BT
1 1 1 rg
/F1 16 Tf
55 168 Td
(PRONTO PARA COMECAR?) Tj
/F2 10 Tf
0 -15 Td
(Este orcamento tem validade de ${budgetData.validityDays || 30} dias.) Tj
0 0 0 rg
0 -35 Td

/F2 8 Tf
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

7 0 obj
[/DeviceRGB]
endobj

xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000273 00000 n 
0000002000 00000 n 
0000002068 00000 n 
0000002131 00000 n 
trailer
<<
/Size 8
/Root 1 0 R
>>
startxref
2158
%%EOF`;

    console.log('PDF template com cores criado');

    const encoder = new TextEncoder();
    const pdfBytes = encoder.encode(pdfTemplate);
    
    const chunkSize = 3000;
    const base64Chunks: string[] = [];
    
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.slice(i, i + chunkSize);
      const chunkString = String.fromCharCode(...chunk);
      base64Chunks.push(btoa(chunkString));
    }
    
    const base64String = base64Chunks.join('');
    
    console.log('PDF com cores gerado com sucesso, tamanho:', base64String.length);
    
    return base64String;
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(`Falha na geração do PDF: ${error.message}`);
  }
}
