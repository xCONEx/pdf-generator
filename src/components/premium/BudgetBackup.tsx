
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, Search, Download, Trash2, Eye, Copy, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BudgetData, ServiceItem } from '@/types/budget';

interface SavedBudget {
  id: string;
  client_name: string;
  total_value: number;
  items: ServiceItem[];
  validity_days: number;
  discount: number;
  color_theme: string;
  special_conditions: string;
  observations: string;
  created_at: string;
  updated_at: string;
}

interface BudgetBackupProps {
  onLoadBudget: (budgetData: BudgetData) => void;
}

const BudgetBackup = ({ onLoadBudget }: BudgetBackupProps) => {
  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<SavedBudget | null>(null);

  useEffect(() => {
    loadSavedBudgets();
  }, []);

  const loadSavedBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Convert Json to ServiceItem[]
      const convertedData = (data || []).map(budget => ({
        ...budget,
        items: Array.isArray(budget.items) ? budget.items as ServiceItem[] : []
      }));

      setSavedBudgets(convertedData);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar orçamentos salvos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (budgetData: BudgetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const totalValue = budgetData.items.reduce((sum, item) => sum + item.total, 0);

      const { error } = await supabase
        .from('saved_budgets')
        .insert({
          user_id: user.id,
          client_name: budgetData.clientInfo.name,
          total_value: totalValue,
          items: budgetData.items as any, // Cast to Json type
          validity_days: budgetData.validityDays,
          discount: budgetData.discount,
          color_theme: budgetData.colorTheme,
          special_conditions: budgetData.specialConditions,
          observations: budgetData.observations
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Orçamento salvo com sucesso'
      });

      loadSavedBudgets();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar orçamento',
        variant: 'destructive'
      });
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Orçamento excluído com sucesso'
      });

      loadSavedBudgets();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir orçamento',
        variant: 'destructive'
      });
    }
  };

  const loadBudgetIntoForm = (budget: SavedBudget) => {
    const budgetData: BudgetData = {
      companyInfo: {
        name: '',
        email: '',
        phone: '',
        address: ''
      },
      clientInfo: {
        name: budget.client_name,
        email: '',
        phone: '',
        address: ''
      },
      items: budget.items,
      specialConditions: budget.special_conditions || '',
      observations: budget.observations || '',
      colorTheme: budget.color_theme,
      validityDays: budget.validity_days,
      discount: budget.discount
    };

    onLoadBudget(budgetData);
    toast({
      title: 'Orçamento Carregado',
      description: 'Orçamento foi carregado no formulário'
    });
  };

  const duplicateBudget = async (budget: SavedBudget) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_budgets')
        .insert({
          user_id: user.id,
          client_name: `${budget.client_name} (Cópia)`,
          total_value: budget.total_value,
          items: budget.items,
          validity_days: budget.validity_days,
          discount: budget.discount,
          color_theme: budget.color_theme,
          special_conditions: budget.special_conditions,
          observations: budget.observations
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Orçamento duplicado com sucesso'
      });

      loadSavedBudgets();
    } catch (error) {
      console.error('Erro ao duplicar orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao duplicar orçamento',
        variant: 'destructive'
      });
    }
  };

  const exportBudgets = () => {
    const csvContent = [
      'Cliente,Valor Total,Itens,Data Criação,Data Atualização',
      ...filteredBudgets.map(budget => 
        `"${budget.client_name}","R$ ${budget.total_value.toFixed(2)}","${budget.items.length}","${new Date(budget.created_at).toLocaleDateString('pt-BR')}","${new Date(budget.updated_at).toLocaleDateString('pt-BR')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orcamentos-backup-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredBudgets = savedBudgets.filter(budget =>
    budget.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Backup de Orçamentos</h3>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Enterprise
          </Badge>
        </div>
        <Button size="sm" onClick={exportBudgets}>
          <Download className="w-4 h-4 mr-1" />
          Exportar CSV
        </Button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{budget.client_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {budget.items.length} {budget.items.length === 1 ? 'item' : 'itens'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium text-green-600">
                        R$ {budget.total_value.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(budget.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedBudget(budget)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadBudgetIntoForm(budget)}
                    >
                      Carregar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateBudget(budget)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteBudget(budget.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento salvo ainda'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{selectedBudget.client_name}</h3>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBudget(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="font-semibold text-lg text-green-600">
                      R$ {selectedBudget.total_value.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Desconto</p>
                    <p className="font-semibold">{selectedBudget.discount}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Validade</p>
                    <p className="font-semibold">{selectedBudget.validity_days} dias</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Criado em</p>
                    <p className="font-semibold">
                      {new Date(selectedBudget.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Itens ({selectedBudget.items.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedBudget.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{item.description}</p>
                          <p className="text-xs text-gray-600">
                            {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">R$ {item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBudget.special_conditions && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Condições Especiais</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedBudget.special_conditions}</p>
                  </div>
                )}

                {selectedBudget.observations && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Observações</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedBudget.observations}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => loadBudgetIntoForm(selectedBudget)} className="flex-1">
                    Carregar no Formulário
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => duplicateBudget(selectedBudget)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetBackup;
