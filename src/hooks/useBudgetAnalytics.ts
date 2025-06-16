
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BudgetAnalytics {
  totalBudgets: number;
  totalValue: number;
  activeClients: number;
  avgBudgetValue: number;
  monthlyGrowth: number;
  recentBudgets: Array<{
    id: string;
    client: string;
    value: number;
    status: string;
    date: string;
  }>;
  statusDistribution: {
    approved: number;
    pending: number;
    rejected: number;
    draft: number;
  };
}

export const useBudgetAnalytics = () => {
  const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar todos os orçamentos do usuário da tabela saved_budgets
      const { data: budgets, error } = await supabase
        .from('saved_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!budgets) {
        setAnalytics({
          totalBudgets: 0,
          totalValue: 0,
          activeClients: 0,
          avgBudgetValue: 0,
          monthlyGrowth: 0,
          recentBudgets: [],
          statusDistribution: { approved: 0, pending: 0, rejected: 0, draft: 0 }
        });
        return;
      }

      // Calcular métricas
      const totalBudgets = budgets.length;
      const totalValue = budgets.reduce((sum, budget) => sum + Number(budget.total_value), 0);
      const activeClients = new Set(budgets.map(b => b.client_name)).size;
      const avgBudgetValue = totalBudgets > 0 ? totalValue / totalBudgets : 0;

      // Calcular crescimento mensal (comparar com mês anterior)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthBudgets = budgets.filter(b => {
        const date = new Date(b.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const lastMonthBudgets = budgets.filter(b => {
        const date = new Date(b.created_at);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      });

      const monthlyGrowth = lastMonthBudgets.length > 0 
        ? ((currentMonthBudgets.length - lastMonthBudgets.length) / lastMonthBudgets.length) * 100
        : 0;

      // Orçamentos recentes (últimos 5) - como não temos status, usamos "Rascunho" por padrão
      const recentBudgets = budgets.slice(0, 5).map(budget => ({
        id: budget.id,
        client: budget.client_name,
        value: Number(budget.total_value),
        status: 'Rascunho', // Valor padrão já que não temos campo status
        date: budget.created_at
      }));

      // Como não temos campo status, todos são considerados draft
      const statusDistribution = {
        approved: 0,
        pending: 0,
        rejected: 0,
        draft: totalBudgets
      };

      setAnalytics({
        totalBudgets,
        totalValue,
        activeClients,
        avgBudgetValue,
        monthlyGrowth,
        recentBudgets,
        statusDistribution
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de analytics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return { analytics, loading, refetch: loadAnalytics };
};
