import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Calendar, Trash2 } from 'lucide-react';
import { useBudgetAnalytics } from '@/hooks/useBudgetAnalytics';
import { useSavedBudgets } from '@/hooks/useSavedBudgets';

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnalyticsModal = ({ open, onOpenChange }: AnalyticsModalProps) => {
  const { analytics, loading, refetch } = useBudgetAnalytics();
  const { deleteBudgets } = useSavedBudgets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'text-green-600 bg-green-100';
      case 'Enviado': return 'text-blue-600 bg-blue-100';
      case 'Rejeitado': return 'text-red-600 bg-red-100';
      case 'Finalizado': return 'text-purple-600 bg-purple-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const calculateApprovalRate = () => {
    if (!analytics) return 0;
    const total = analytics.totalBudgets;
    const approved = analytics.statusDistribution.approved;
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  };

  const handleDeleteBudget = async (budgetId: string) => {
    await deleteBudgets([budgetId]);
    // Recarregar dados após exclusão
    refetch();
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-800">
              <BarChart3 className="w-6 h-6 mr-2" />
              Analytics Dashboard
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!analytics) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-800">
              <BarChart3 className="w-6 h-6 mr-2" />
              Analytics Dashboard
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum dado de analytics disponível.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-800">
            <BarChart3 className="w-6 h-6 mr-2" />
            Analytics Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Total de Orçamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.totalBudgets}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {analytics.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Clientes Únicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.activeClients}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Crescimento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analytics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.monthlyGrowth >= 0 ? '+' : ''}{analytics.monthlyGrowth.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orçamentos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Orçamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.recentBudgets.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentBudgets.map((budget) => (
                    <div key={budget.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-medium">{budget.client}</p>
                        <p className="text-sm text-gray-500">{new Date(budget.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-bold text-lg">
                          R$ {budget.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                          {budget.status}
                        </span>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum orçamento encontrado.</p>
              )}
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Médio por Orçamento</p>
                  <p className="text-xl font-bold text-blue-600">
                    R$ {analytics.avgBudgetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                  <p className="text-xl font-bold text-green-600">{calculateApprovalRate()}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsModal;
