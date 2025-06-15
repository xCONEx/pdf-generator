
import { supabase } from '@/integrations/supabase/client';
import { BudgetData } from '@/types/budget';

export const generateSecurePDF = async (budgetData: BudgetData): Promise<Blob> => {
  try {
    // Verificar licença do usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se o usuário tem licença válida
    const { data: license, error: licenseError } = await supabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (licenseError || !license || license.status !== 'active') {
      throw new Error('Licença inválida ou expirada');
    }

    // Verificar limite de PDFs
    if (license.pdfs_generated >= license.pdf_limit) {
      throw new Error('Limite de PDFs atingido');
    }

    console.log('Chamando Edge Function para gerar PDF...');

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
      console.error('Erro na Edge Function:', error);
      throw new Error(`Erro na geração segura: ${error.message}`);
    }

    if (!data || !data.pdf) {
      throw new Error('PDF não foi gerado pela Edge Function');
    }

    console.log('PDF recebido da Edge Function, convertendo para blob...');

    // Converter base64 para Blob de forma mais robusta
    try {
      const pdfBlob = base64ToBlob(data.pdf, 'application/pdf');
      console.log('Blob criado com sucesso, tamanho:', pdfBlob.size);
      
      // Verificar se o blob não está vazio
      if (pdfBlob.size === 0) {
        throw new Error('PDF gerado está vazio');
      }
      
      return pdfBlob;
    } catch (blobError) {
      console.error('Erro ao converter para blob:', blobError);
      throw new Error('Erro na conversão do PDF');
    }

  } catch (error) {
    console.error('Erro na geração segura de PDF:', error);
    throw error;
  }
};

const generateFingerprint = async (): Promise<string> => {
  try {
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
  } catch (error) {
    console.error('Erro ao gerar fingerprint:', error);
    return 'fallback-' + Date.now().toString();
  }
};

const base64ToBlob = (base64: string, contentType: string): Blob => {
  try {
    console.log('Convertendo base64 para blob, tamanho:', base64.length);
    
    // Validar se o base64 não está vazio
    if (!base64 || base64.length === 0) {
      throw new Error('Base64 está vazio');
    }
    
    // Limpar qualquer caractere inválido e validar formato
    const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    
    // Verificar se o tamanho é válido (múltiplo de 4)
    if (cleanBase64.length % 4 !== 0) {
      throw new Error('Base64 com formato inválido');
    }
    
    console.log('Base64 limpo, tamanho:', cleanBase64.length);
    
    // Decodificar base64 em chunks para evitar problemas de memória
    const chunkSize = 1024;
    const byteArrays: Uint8Array[] = [];
    
    for (let offset = 0; offset < cleanBase64.length; offset += chunkSize) {
      const chunk = cleanBase64.slice(offset, offset + chunkSize);
      const byteCharacters = atob(chunk);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    
    // Combinar todos os chunks
    const totalLength = byteArrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const arr of byteArrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    
    const blob = new Blob([result], { type: contentType });
    
    console.log('Blob criado:', blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('Erro ao converter base64 para blob:', error);
    throw new Error(`Erro na conversão do PDF - formato inválido: ${error.message}`);
  }
};
