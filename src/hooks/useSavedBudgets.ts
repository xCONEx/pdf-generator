
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SavedBudget {
  id: string;
  clientName: string;
  budgetTitle: string;
  value: number;
  createdAt: string;
  items: number;
  status: string;
  finalValue: number;
}

export const useSavedBudgets = () => {
  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: budgets, error } = await supabase
        .from('saved_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBudgets: SavedBudget[] = (budgets || []).map(budget => ({
        id: budget.id,
        clientName: budget.client_name,
        budgetTitle: `Orçamento para ${budget.client_name}`,
        value: Number(budget.total_value),
        finalValue: Number(budget.total_value),
        createdAt: budget.created_at,
        items: Array.isArray(budget.items) ? budget.items.length : 0,
        status: 'Rascunho'
      }));

      setSavedBudgets(formattedBudgets);
    } catch (error) {
      console.error('Erro ao carregar orçamentos salvos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos salvos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBudgets = async (budgetIds: string[]) => {
    try {
      console.log('Deletando orçamentos com IDs:', budgetIds);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Garantir que só deleta orçamentos do usuário atual e com os IDs específicos
      const { error } = await supabase
        .from('saved_budgets')
        .delete()
        .eq('user_id', user.id)
        .in('id', budgetIds);

      if (error) {
        console.error('Erro ao deletar orçamentos:', error);
        throw error;
      }

      // Atualizar estado local removendo apenas os IDs deletados
      setSavedBudgets(prev => prev.filter(budget => !budgetIds.includes(budget.id)));
      
      toast({
        title: "Sucesso!",
        description: `${budgetIds.length} orçamento(s) excluído(s) com sucesso.`,
      });

      // Recarregar dados para garantir consistência
      await loadSavedBudgets();
    } catch (error) {
      console.error('Erro ao excluir orçamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os orçamentos.",
        variant: "destructive",
      });
    }
  };

  const loadBudget = async (budgetId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: budget, error } = await supabase
        .from('saved_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', budgetId)
        .single();

      if (error) throw error;

      console.log('Orçamento carregado:', budget);
      toast({
        title: "Sucesso!",
        description: "Orçamento carregado com sucesso.",
      });

      return budget;
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o orçamento.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSavedBudgets();
  }, []);

  return {
    savedBudgets,
    loading,
    deleteBudgets,
    loadBudget,
    refetch: loadSavedBudgets
  };
};
