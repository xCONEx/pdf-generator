
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyInfo } from '@/types/budget';
import { toast } from '@/hooks/use-toast';

interface CompanyProfile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanyProfile = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCompanyProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCompanyProfile({
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          logoUrl: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil da empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyProfile = async (companyInfo: CompanyInfo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Salvando dados da empresa:', companyInfo);

      // Verificar se já existe um perfil para esse usuário
      const { data: existingProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileData = {
        name: companyInfo.name,
        email: companyInfo.email,
        phone: companyInfo.phone,
        address: companyInfo.address,
        logo_url: companyInfo.logoUrl,
        updated_at: new Date().toISOString()
      };

      let result;

      if (existingProfile) {
        // Atualizar perfil existente
        console.log('Atualizando perfil existente com ID:', existingProfile.id);
        result = await supabase
          .from('company_profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
          .select();
      } else {
        // Criar novo perfil
        console.log('Criando novo perfil para o usuário:', user.id);
        result = await supabase
          .from('company_profiles')
          .insert([{
            user_id: user.id,
            ...profileData,
            created_at: new Date().toISOString()
          }])
          .select();
      }

      if (result.error) {
        console.error('Erro detalhado ao salvar:', result.error);
        throw result.error;
      }

      console.log('Perfil salvo com sucesso:', result.data);
      setCompanyProfile(companyInfo);
      toast({
        title: "Sucesso!",
        description: "Dados da empresa salvos com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil da empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados da empresa.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  return {
    companyProfile,
    loading,
    saveCompanyProfile,
    loadCompanyProfile
  };
};
