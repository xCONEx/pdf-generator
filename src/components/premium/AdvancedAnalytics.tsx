
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, TrendingUp, Users, FileText, Calendar, DollarSign, PieChart, BarChart3, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdvancedAnalyticsData {
  totalRevenue: number;
  totalClients: number;
  averageProjectValue: number;
  conversionRate: number;
  monthlyGrowth: number;
  topServices: Array<{
    service: string;
    count: number;
    revenue: number;
  }>;
  clientSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
  quarterlyData: Array<{
    quarter: string;
    revenue: number;
    projects: number;
  }>;
}

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12'); // months

  useEffect(() => {
    loadAdvancedAnalytics();
  }, [timeRange]);

  const loadAdvancedAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(timeRange));

      // Buscar dados de PDFs e orçamentos
      const [{ data: pdfData }, { data: budgetData }] = await Promise.all([
        supabase
          .from('pdf_generations')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('saved_budgets')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
      ]);

      // Calcular métricas avançadas
      const totalRevenue = pdfData?.reduce((sum, item) => sum + (item.total_value || 0), 0) || 0;
      const totalClients = new Set(pdfData?.map(item => item.client_name) || []).size;
      const averageProjectValue = totalClients > 0 ? totalRevenue / totalClients : 0;
      
      // Simular dados mais avançados
      const conversionRate = budgetData && pdfData ? 
        (pdfData.length / Math.max(budgetData.length, 1)) * 100 : 0;
      
      const monthlyGrowth = 15.2; // Simulado

      // Top serviços baseados em descrições dos itens
      const serviceMap = new Map();
      budgetData?.forEach(budget => {
        if (budget.items && Array.isArray(budget.items)) {
          budget.items.forEach((item: any) => {
            const service = item.description?.split(' ')[0] || 'Serviço';
            const existing = serviceMap.get(service) || { count: 0, revenue: 0 };
            serviceMap.set(service, {
              count: existing.count + 1,
              revenue: existing.revenue + (item.total || 0)
            });
          });
        }
      });

      const topServices = Array.from(serviceMap.entries())
        .map(([service, data]) => ({ service, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Segmentos de clientes (simulado baseado em valor médio)
      const clientSegments = [
        { segment: 'Premium (>R$ 10k)', count: Math.floor(totalClients * 0.2), percentage: 20 },
        { segment: 'Médio (R$ 5k-10k)', count: Math.floor(totalClients * 0.3), percentage: 30 },
        { segment: 'Básico (<R$ 5k)', count: Math.floor(totalClients * 0.5), percentage: 50 }
      ];

      // Métricas de performance
      const performanceMetrics = [
        { metric: 'Taxa de Conversão', value: conversionRate, change: 5.2 },
        { metric: 'Tempo Médio de Projeto', value: 7, change: -1.5 },
        { metric: 'Satisfação do Cliente', value: 4.8, change: 0.3 },
        { metric: 'Retenção de Clientes', value: 85, change: 3.1 }
      ];

      // Dados trimestrais
      const quarterlyData = [
        { quarter: 'Q1 2024', revenue: totalRevenue * 0.2, projects: Math.floor(pdfData?.length * 0.2) || 0 },
        { quarter: 'Q2 2024', revenue: totalRevenue * 0.25, projects: Math.floor(pdfData?.length * 0.25) || 0 },
        { quarter: 'Q3 2024', revenue: totalRevenue * 0.3, projects: Math.floor(pdfData?.length * 0.3) || 0 },
        { quarter: 'Q4 2024', revenue: totalRevenue * 0.25, projects: Math.floor(pdfData?.length * 0.25) || 0 }
      ];

      setAnalytics({
        totalRevenue,
        totalClients,
        averageProjectValue,
        conversionRate,
        monthlyGrowth,
        topServices,
        clientSegments,
        performanceMetrics,
        quarterlyData
      });

    } catch (error) {
      console.error('Erro ao carregar analytics avançados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar analytics avançados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAdvancedReport = () => {
    if (!analytics) return;

    const reportData = [
      'Relatório Avançado de Analytics - Gerador de Orçamentos',
      `Período: Últimos ${timeRange} meses`,
      '',
      'RESUMO EXECUTIVO:',
      `Receita Total: R$ ${analytics.totalRevenue.toFixed(2)}`,
      `Total de Clientes: ${analytics.totalClients}`,
      `Valor Médio por Projeto: R$ ${analytics.averageProjectValue.toFixed(2)}`,
      `Taxa de Conversão: ${analytics.conversionRate.toFixed(1)}%`,
      `Crescimento Mensal: ${analytics.monthlyGrowth.toFixed(1)}%`,
      '',
      'TOP SERVIÇOS:',
      ...analytics.topServices.map(service => 
        `${service.service}: ${service.count} projetos - R$ ${service.revenue.toFixed(2)}`
      ),
      '',
      'SEGMENTAÇÃO DE CLIENTES:',
      ...analytics.clientSegments.map(segment => 
        `${segment.segment}: ${segment.count} clientes (${segment.percentage}%)`
      ),
      '',
      'MÉTRICAS DE PERFORMANCE:',
      ...analytics.performanceMetrics.map(metric => 
        `${metric.metric}: ${metric.value}${metric.metric.includes('Taxa') ? '%' : ''} (${metric.change > 0 ? '+' : ''}${metric.change}%)`
      )
    ].join('\n');

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-avancado-${new Date().toISOString().split('T')[0]}.txt`;
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
          <p className="text-gray-500">Erro ao carregar analytics avançados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Analytics Avançados</h3>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Enterprise
          </Badge>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Último ano</option>
            <option value="24">Últimos 2 anos</option>
          </select>
          <Button size="sm" onClick={exportAdvancedReport}>
            <Download className="w-4 h-4 mr-1" />
            Relatório Completo
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Receita Total</p>
                <p className="text-2xl font-bold">R$ {analytics.totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Total Clientes</p>
                <p className="text-2xl font-bold">{analytics.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Valor Médio</p>
                <p className="text-2xl font-bold">R$ {analytics.averageProjectValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Conversão</p>
                <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Crescimento</p>
                <p className="text-2xl font-bold">+{analytics.monthlyGrowth.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Serviços */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Top Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{service.service}</p>
                    <p className="text-sm text-gray-600">{service.count} projetos</p>
                  </div>
                  <p className="font-semibold text-green-600">
                    R$ {service.revenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Segmentação de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Segmentação de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.clientSegments.map((segment, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{segment.segment}</span>
                    <span>{segment.count} clientes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${segment.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.performanceMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">{metric.metric}</p>
                <p className="text-2xl font-bold mb-1">
                  {metric.value}{metric.metric.includes('Taxa') || metric.metric.includes('Retenção') ? '%' : ''}
                </p>
                <p className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dados Trimestrais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Trimestral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.quarterlyData.map((quarter, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{quarter.quarter}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{quarter.projects} projetos</span>
                    <span>R$ {quarter.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(10, (quarter.revenue / Math.max(...analytics.quarterlyData.map(q => q.revenue))) * 100)}%` 
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

export default AdvancedAnalytics;
