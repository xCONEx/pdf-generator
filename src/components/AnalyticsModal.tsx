
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Calendar } from 'lucide-react';

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnalyticsModal = ({ open, onOpenChange }: AnalyticsModalProps) => {
  // Dados simulados para demonstração
  const analyticsData = {
    totalBudgets: 47,
    totalValue: 125430.50,
    activeClients: 23,
    avgBudgetValue: 2667.67,
    monthlyGrowth: 12.5,
    recentBudgets: [
      { id: 1, client: 'Empresa ABC', value: 5500, status: 'Aprovado', date: '2024-06-15' },
      { id: 2, client: 'Cliente XYZ', value: 3200, status: 'Pendente', date: '2024-06-14' },
      { id: 3, client: 'Negócios 123', value: 7800, status: 'Aprovado', date: '2024-06-13' },
      { id: 4, client: 'Startup Tech', value: 4100, status: 'Rejeitado', date: '2024-06-12' },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'text-green-600 bg-green-100';
      case 'Pendente': return 'text-yellow-600 bg-yellow-100';
      case 'Rejeitado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
                  {analyticsData.totalBudgets}
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
                  R$ {analyticsData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Clientes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.activeClients}
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
                <div className="text-2xl font-bold text-orange-600">
                  +{analyticsData.monthlyGrowth}%
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
              <div className="space-y-3">
                {analyticsData.recentBudgets.map((budget) => (
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Valor Médio */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Médio por Orçamento</p>
                  <p className="text-xl font-bold text-blue-600">
                    R$ {analyticsData.avgBudgetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                  <p className="text-xl font-bold text-green-600">67%</p>
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
