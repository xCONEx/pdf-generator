
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClientInfo } from '@/types/budget';
import { toast } from '@/hooks/use-toast';

interface SavedClient {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export const useSavedClients = () => {
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const clients: ClientInfo[] = data.map(client => ({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || ''
      }));

      setSavedClients(clients);
    } catch (error) {
      console.error('Erro ao carregar clientes salvos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes salvos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveClient = async (clientInfo: ClientInfo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se o cliente já existe
      const { data: existingClient } = await supabase
        .from('saved_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', clientInfo.name)
        .eq('email', clientInfo.email)
        .maybeSingle();

      if (existingClient) {
        toast({
          title: "Aviso",
          description: "Este cliente já está salvo.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('saved_clients')
        .insert({
          user_id: user.id,
          name: clientInfo.name,
          email: clientInfo.email,
          phone: clientInfo.phone,
          address: clientInfo.address
        });

      if (error) throw error;

      setSavedClients(prev => [clientInfo, ...prev]);
      toast({
        title: "Sucesso!",
        description: "Cliente salvo com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cliente.",
        variant: "destructive",
      });
    }
  };

  const deleteClient = async (clientInfo: ClientInfo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('saved_clients')
        .delete()
        .eq('user_id', user.id)
        .eq('name', clientInfo.name)
        .eq('email', clientInfo.email);

      if (error) throw error;

      setSavedClients(prev => prev.filter(client => 
        !(client.name === clientInfo.name && client.email === clientInfo.email)
      ));
      toast({
        title: "Sucesso!",
        description: "Cliente removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cliente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSavedClients();
  }, []);

  return {
    savedClients,
    loading,
    saveClient,
    deleteClient,
    loadSavedClients
  };
};
