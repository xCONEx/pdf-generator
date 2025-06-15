
import { supabase } from '@/integrations/supabase/client';
import { BudgetData } from '@/types/budget';

export const generateSecurePDF = async (budgetData: BudgetData): Promise<Blob> => {
  try {
    // Verificar licença do usuário
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Chamar Edge Function para gerar PDF seguro
    const { data, error } = await supabase.functions.invoke('generate-secure-pdf', {
      body: {
        budgetData,
        userId: user.id,
        timestamp: new Date().toISOString(),
        fingerprint: await generateFingerprint(),
      },
    });

    if (error) {
      throw error;
    }

    // Registrar geração do PDF
    await logPdfGeneration(user.id, budgetData);

    // Converter base64 para Blob
    const pdfBlob = base64ToBlob(data.pdf, 'application/pdf');
    return pdfBlob;

  } catch (error) {
    console.error('Erro na geração segura de PDF:', error);
    throw error;
  }
};

const generateFingerprint = async (): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Security fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width + 'x' + screen.height,
    canvas.toDataURL(),
  ].join('|');

  // Hash simples do fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
};

const logPdfGeneration = async (userId: string, budgetData: BudgetData) => {
  await supabase.from('pdf_generations').insert({
    user_id: userId,
    client_name: budgetData.clientInfo.name,
    total_value: budgetData.items.reduce((sum, item) => sum + item.total, 0),
    fingerprint: await generateFingerprint(),
  });

  // Atualizar contador de PDFs da licença
  await supabase.rpc('increment_pdf_count', { user_id: userId });
};

const base64ToBlob = (base64: string, contentType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};
