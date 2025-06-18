
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserLicense {
  id: string;
  email: string;
  plan: string;
  status: string;
  expires_at: string;
  pdfs_generated: number;
  pdf_limit: number;
}

export const useLicenseValidation = () => {
  const [license, setLicense] = useState<UserLicense | null>(null);
  const [loading, setLoading] = useState(true);
  const [canGeneratePDF, setCanGeneratePDF] = useState(false);

  const checkLicense = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        setLoading(false);
        return;
      }

      console.log('Verificando licença para usuário:', user.email);

      const { data: licenseData, error } = await supabase
        .from('user_licenses')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar licença:', error);
        throw error;
      }

      console.log('Dados da licença encontrados:', licenseData);

      if (!licenseData) {
        console.log('Nenhuma licença encontrada para:', user.email);
        // Criar licença básica para usuários sem licença
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias de trial

        const { data: newLicense, error: createError } = await supabase
          .from('user_licenses')
          .insert({
            email: user.email,
            plan: 'basic',
            status: 'active',
            expires_at: expiresAt.toISOString(),
            pdf_limit: 3,
            pdfs_generated: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar licença básica:', createError);
          throw createError;
        }

        console.log('Licença básica criada:', newLicense);
        setLicense(newLicense);
        setCanGeneratePDF(true);
      } else {
        setLicense(licenseData);
        
        // Verificar se pode gerar PDF
        const now = new Date();
        const expiresAt = new Date(licenseData.expires_at);
        const isExpired = now > expiresAt;
        const hasReachedLimit = licenseData.pdfs_generated >= licenseData.pdf_limit;
        const isActive = licenseData.status === 'active';

        console.log('Status da licença:', {
          isExpired,
          hasReachedLimit,
          isActive,
          pdfs_generated: licenseData.pdfs_generated,
          pdf_limit: licenseData.pdf_limit
        });

        setCanGeneratePDF(isActive && !isExpired && !hasReachedLimit);
      }
    } catch (error) {
      console.error('Erro ao verificar licença:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar sua licença.',
        variant: 'destructive',
      });
      setCanGeneratePDF(false);
    } finally {
      setLoading(false);
    }
  };

  const incrementPdfCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !license) return;

      console.log('Incrementando contador de PDFs para usuário:', user.email);

      const { error } = await supabase.rpc('increment_pdf_count', { 
        user_id: license.id 
      });

      if (error) {
        console.error('Erro ao incrementar contador:', error);
        throw error;
      }

      // Atualizar estado local
      setLicense(prev => prev ? {
        ...prev,
        pdfs_generated: prev.pdfs_generated + 1
      } : null);

      // Verificar se ainda pode gerar PDFs
      if (license.pdfs_generated + 1 >= license.pdf_limit) {
        setCanGeneratePDF(false);
        toast({
          title: 'Limite Atingido',
          description: 'Você atingiu o limite de PDFs do seu plano.',
          variant: 'destructive',
        });
      }

      console.log('Contador incrementado. Novo total:', license.pdfs_generated + 1);
    } catch (error) {
      console.error('Erro ao incrementar contador de PDFs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar contador de PDFs.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    checkLicense();
  }, []);

  return {
    license,
    loading,
    canGeneratePDF,
    incrementPdfCount,
    refetch: checkLicense,
  };
};
