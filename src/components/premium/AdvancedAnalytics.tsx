
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, DollarSign, FileText, Users, Calendar } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdvancedAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Analytics Avançados Enterprise</h2>
          <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
        </div>
        <p className="text-gray-600">
          Análise completa dos seus orçamentos com insights detalhados para seu negócio
        </p>
      </div>

      {/* Cards de Prévia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Análise de Vendas</h3>
            <p className="text-sm text-blue-600">Tendências e padrões de vendas</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Perfil de Clientes</h3>
            <p className="text-sm text-green-600">Comportamento e preferências</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800">Performance Financeira</h3>
            <p className="text-sm text-purple-600">ROI e métricas de crescimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Completo */}
      <AnalyticsDashboard />

      {/* Insights Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Relatórios Personalizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Gere relatórios customizados com os dados que mais importam para seu negócio:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Relatório de vendas por período
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Análise de clientes mais lucrativos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Comparativo de performance mensal
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Previsões de faturamento
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Insights Automatizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Receba insights automáticos baseados em seus dados:
            </p>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800">💡 Dica de Vendas</p>
                <p className="text-xs text-blue-600 mt-1">
                  Seus clientes preferem orçamentos na faixa de R$ 2.000 - R$ 5.000
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">📈 Oportunidade</p>
                <p className="text-xs text-green-600 mt-1">
                  Terças-feiras têm 40% mais conversões de orçamentos
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800">⚠️ Atenção</p>
                <p className="text-xs text-yellow-600 mt-1">
                  3 clientes não respondem há mais de 30 dias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
