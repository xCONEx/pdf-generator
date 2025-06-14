
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Download, FileText, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalPdfs: number;
  totalValue: number;
  avgValue: number;
  topClients: Array<{
    name: string;
    count: number;
    totalValue: number;
  }>;
  monthlyData: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  recentActivity: Array<{
    date: string;
    client: string;
    value: number;
  }>;
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Buscar dados de PDFs gerados
      const { data: pdfData, error: pdfError } = await supabase
        .from('pdf_generations')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (pdfError) throw pdfError;

      // Buscar orçamentos salvos para análise adicional
      const { data: budgetData, error: budgetError } = await supabase
        .from('saved_budgets')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (budgetError) throw budgetError;

      // Processar dados para analytics
      const totalPdfs = pdfData?.length || 0;
      const totalValue = pdfData?.reduce((sum, item) => sum + (item.total_value || 0), 0) || 0;
      const avgValue = totalPdfs > 0 ? totalValue / totalPdfs : 0;

      // Top clientes
      const clientMap = new Map();
      pdfData?.forEach(item => {
        const existing = clientMap.get(item.client_name) || { count: 0, totalValue: 0 };
        clientMap.set(item.client_name, {
          name: item.client_name,
          count: existing.count + 1,
          totalValue: existing.totalValue + (item.total_value || 0)
        });
      });
      const topClients = Array.from(clientMap.values())
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

      // Dados mensais (últimos 6 meses)
      const monthlyMap = new Map();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().substring(0, 7); // YYYY-MM
      }).reverse();

      last6Months.forEach(month => {
        monthlyMap.set(month, { month, count: 0, value: 0 });
      });

      pdfData?.forEach(item => {
        const month = item.created_at?.substring(0, 7);
        if (month && monthlyMap.has(month)) {
          const existing = monthlyMap.get(month);
          monthlyMap.set(month, {
            ...existing,
            count: existing.count + 1,
            value: existing.value + (item.total_value || 0)
          });
        }
      });

      const monthlyData = Array.from(monthlyMap.values());

      // Atividade recente
      const recentActivity = pdfData?.slice(0, 10).map(item => ({
        date: new Date(item.created_at || '').toLocaleDateString('pt-BR'),
        client: item.client_name,
        value: item.total_value || 0
      })) || [];

      setAnalytics({
        totalPdfs,
        totalValue,
        avgValue,
        topClients,
        monthlyData,
        recentActivity
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados de analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const csvContent = [
      'Relatório de Analytics - Gerador de Orçamentos',
      '',
      'Resumo Geral:',
      `Total de PDFs Gerados,${analytics.totalPdfs}`,
      `Valor Total dos Orçamentos,R$ ${analytics.totalValue.toFixed(2)}`,
      `Valor Médio por Orçamento,R$ ${analytics.avgValue.toFixed(2)}`,
      '',
      'Top Clientes:',
      'Cliente,Quantidade,Valor Total',
      ...analytics.topClients.map(client => 
        `${client.name},${client.count},R$ ${client.totalValue.toFixed(2)}`
      ),
      '',
      'Atividade Recente:',
      'Data,Cliente,Valor',
      ...analytics.recentActivity.map(activity => 
        `${activity.date},${activity.client},R$ ${activity.value.toFixed(2)}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Erro ao carregar dados de analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Analytics</h3>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Enterprise
          </Badge>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <Button size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-1" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">PDFs Gerados</p>
                <p className="text-2xl font-bold">{analytics.totalPdfs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">R$ {analytics.totalValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Valor Médio</p>
                <p className="text-2xl font-bold">R$ {analytics.avgValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Período</p>
                <p className="text-2xl font-bold">{dateRange}d</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topClients.length > 0 ? (
                analytics.topClients.map((client, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.count} orçamentos</p>
                    </div>
                    <p className="font-semibold text-green-600">
                      R$ {client.totalValue.toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border-l-4 border-blue-500 bg-blue-50">
                    <div>
                      <p className="font-medium">{activity.client}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <p className="font-semibold">R$ {activity.value.toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyData.map((month, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium">
                  {new Date(month.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{month.count} PDFs</span>
                    <span>R$ {month.value.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(5, (month.value / Math.max(...analytics.monthlyData.map(m => m.value))) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
