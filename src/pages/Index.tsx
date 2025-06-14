
import BudgetForm from '@/components/BudgetForm';
import UserDashboard from '@/components/UserDashboard';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Sparkles, BarChart3, FileText, Palette, Archive } from 'lucide-react';
import ExclusiveTemplates from '@/components/premium/ExclusiveTemplates';
import AdvancedAnalytics from '@/components/premium/AdvancedAnalytics';
import PremiumFeatures from '@/components/premium/PremiumFeatures';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showExclusiveTemplates, setShowExclusiveTemplates] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showAllPremiumFeatures, setShowAllPremiumFeatures] = useState(false);
  const { license, loading, getPlanDisplayName } = useLicenseValidation();

  // Check if user is admin
  const isAdmin = user?.email === 'adm.financeflow@gmail.com' || user?.email === 'yuriadrskt@gmail.com';
  const isEnterpriseOrAdmin = license?.plan === 'enterprise' || isAdmin;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não tem licença ou licença inválida, mostrar mensagem
  if (!license || license.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Licença Inválida ou Expirada
          </h2>
          <p className="text-gray-600 mb-6">
            Sua licença não está ativa ou expirou. Entre em contato com o suporte para renovar.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar limite de PDFs (apenas para planos que não são enterprise)
  if (license.plan !== 'enterprise' && !isAdmin && license.pdfs_generated >= license.pdf_limit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            Limite de PDFs Atingido
          </h2>
          <p className="text-gray-600 mb-6">
            Você atingiu o limite de {license.pdf_limit} PDFs para seu plano {getPlanDisplayName()}.
            Faça upgrade para continuar gerando orçamentos.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              PDFs gerados: {license.pdfs_generated}/{license.pdf_limit}
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerador de Orçamentos
              </h1>
              {isEnterpriseOrAdmin && (
                <div className="flex items-center gap-2 mt-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {isAdmin ? 'Acesso Admin' : 'Plano Enterprise'} - Funcionalidades Premium Desbloqueadas
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
              )}
            </div>
            
            {/* Premium Features Quick Access for Enterprise/Admin */}
            {isEnterpriseOrAdmin && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowExclusiveTemplates(!showExclusiveTemplates)}
                  className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Templates Exclusivos
                  <Crown className="w-4 h-4 ml-1" />
                </Button>
                
                <Button
                  onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytics Avançados
                  <Crown className="w-4 h-4 ml-1" />
                </Button>
                
                <Button
                  onClick={() => setShowAllPremiumFeatures(!showAllPremiumFeatures)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Todas as Funcionalidades
                  <Crown className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Premium Features Showcase for Enterprise/Admin */}
        {isEnterpriseOrAdmin && (
          <div className="mb-8 space-y-6">
            {/* Exclusive Templates Section */}
            {showExclusiveTemplates && (
              <Card className="shadow-lg border-2 border-gradient-to-r from-yellow-400 to-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Templates Exclusivos Enterprise
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <div className="ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExclusiveTemplates(false)}
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExclusiveTemplates 
                    selectedTemplate=""
                    onTemplateSelect={(template) => {
                      console.log('Template selecionado:', template);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Advanced Analytics Section */}
            {showAdvancedAnalytics && (
              <Card className="shadow-lg border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                    Analytics Avançados Enterprise
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <div className="ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvancedAnalytics(false)}
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdvancedAnalytics />
                </CardContent>
              </Card>
            )}

            {/* All Premium Features Section */}
            {showAllPremiumFeatures && (
              <Card className="shadow-lg border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-6 h-6 text-green-500" />
                    Todas as Funcionalidades Premium
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <div className="ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllPremiumFeatures(false)}
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PremiumFeatures 
                    onTemplateSelect={(template) => {
                      console.log('Template premium selecionado:', template);
                    }}
                    onCustomizationChange={(options) => {
                      console.log('Personalização alterada:', options);
                    }}
                    onLoadBudget={(budgetData) => {
                      console.log('Orçamento carregado:', budgetData);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Premium Features Overview Cards */}
            {!showExclusiveTemplates && !showAdvancedAnalytics && !showAllPremiumFeatures && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-purple-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Templates Exclusivos
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      6 templates únicos e exclusivos para seu negócio
                    </p>
                    <Button 
                      onClick={() => setShowExclusiveTemplates(true)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-purple-500"
                      size="sm"
                    >
                      Explorar Templates
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Analytics Avançados
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Relatórios detalhados e insights do seu negócio
                    </p>
                    <Button 
                      onClick={() => setShowAdvancedAnalytics(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      size="sm"
                    >
                      Ver Analytics
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Archive className="w-5 h-5 text-green-500" />
                      Todas as Funcionalidades
                      <Crown className="w-4 h-4 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Acesso completo a todas as funcionalidades premium
                    </p>
                    <Button 
                      onClick={() => setShowAllPremiumFeatures(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600"
                      size="sm"
                    >
                      Acessar Tudo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
        
        {user && license && (
          <UserDashboard user={user} license={license} />
        )}
        <BudgetForm />
      </div>
    </div>
  );
};

export default Index;
