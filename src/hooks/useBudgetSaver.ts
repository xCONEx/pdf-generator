
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BudgetData } from '@/types/budget';

export const useBudgetSaver = () => {
  const saveBudgetToDatabase = async (budgetData: BudgetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Calcular valor total
      const subtotal = budgetData.items.reduce((sum, item) => sum + item.total, 0);
      const totalValue = subtotal - (subtotal * budgetData.discount / 100);

      // Preparar dados para salvar - matching the database schema exactly
      const budgetToSave = {
        user_id: user.id,
        client_name: budgetData.clientInfo.name,
        items: budgetData.items as any, // Cast to Json type for Supabase
        total_value: totalValue,
        special_conditions: budgetData.specialConditions,
        observations: budgetData.observations,
        color_theme: budgetData.colorTheme,
        validity_days: budgetData.validityDays,
        discount: budgetData.discount
      };

      const { data, error } = await supabase
        .from('saved_budgets')
        .insert([budgetToSave])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Orçamento Salvo!",
        description: "Seus dados foram salvos com sucesso no banco de dados.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o orçamento no banco de dados.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { saveBudgetToDatabase };
};
