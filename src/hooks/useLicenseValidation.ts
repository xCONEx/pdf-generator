
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserLicense {
  id: string;
  user_id: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'expired' | 'suspended';
  expires_at: string;
  pdfs_generated: number;
  pdf_limit: number;
  created_at: string;
}

export const useLicenseValidation = () => {
  const [license, setLicense] = useState<UserLicense | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const validateLicense = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLicense(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_licenses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao validar licença:', error);
          setLicense(null);
        } else if (data) {
          // Verificar se a licença expirou
          if (new Date(data.expires_at) < new Date()) {
            await supabase
              .from('user_licenses')
              .update({ status: 'expired' })
              .eq('id', data.id);
            
            toast({
              title: 'Licença Expirada',
              description: 'Sua licença expirou. Renove para continuar usando.',
              variant: 'destructive',
            });
          }
          
          // Cast the database result to our expected types
          const typedLicense: UserLicense = {
            ...data,
            plan: data.plan as 'basic' | 'premium',
            status: data.status as 'active' | 'expired' | 'suspended'
          };
          setLicense(typedLicense);
        }
      } catch (error) {
        console.error('Erro na validação de licença:', error);
        setLicense(null);
      } finally {
        setLoading(false);
      }
    };

    validateLicense();

    // Validar licença a cada 5 minutos
    const interval = setInterval(validateLicense, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [toast]);

  const canGeneratePDF = (): boolean => {
    if (!license || license.status !== 'active') return false;
    if (new Date(license.expires_at) < new Date()) return false;
    if (license.pdfs_generated >= license.pdf_limit) return false;
    return true;
  };

  const getRemainingPDFs = (): number => {
    if (!license) return 0;
    return Math.max(0, license.pdf_limit - license.pdfs_generated);
  };

  return {
    license,
    loading,
    canGeneratePDF,
    getRemainingPDFs,
  };
};
