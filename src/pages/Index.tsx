
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
  const isEnterprise = license?.plan === 'enterprise';
  const hasAccessToPremium = isEnterprise || isAdmin;

  // Debug logging
  console.log('=== DEBUG INFO DETALHADO ===');
  console.log('User email:', user?.email);
  console.log('License objeto completo:', license);
  console.log('License plan:', license?.plan);
  console.log('License status:', license?.status);
  console.log('É Admin?', isAdmin);
  console.log('É Enterprise?', isEnterprise);
  console.log('Tem acesso premium?', hasAccessToPremium);
  console.log('Loading:', loading);
  console.log('==============================');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      console.log('User carregado:', user?.email);
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
            <p className="text-sm text-gray-500">
              Debug: License = {license ? JSON.stringify(license) : 'null'}
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

  // Verificar limite de PDFs (apenas para planos que não são enterprise e não são admin)
  if (!hasAccessToPremium && license.pdfs_generated >= license.pdf_limit) {
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
              
              {/* Debug Info Card - Mais visível */}
              <div className="mt-2 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg text-sm">
                <div className="font-semibold text-blue-800">Status do Sistema:</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-blue-700">
                  <div>Email: {user?.email || 'N/A'}</div>
                  <div>Plano: {license?.plan || 'N/A'}</div>
                  <div>Status: {license?.status || 'N/A'}</div>
                  <div>É Admin: {isAdmin ? 'SIM ✅' : 'NÃO ❌'}</div>
                  <div>É Enterprise: {isEnterprise ? 'SIM ✅' : 'NÃO ❌'}</div>
                  <div>Acesso Premium: {hasAccessToPremium ? 'SIM ✅' : 'NÃO ❌'}</div>
                </div>
              </div>

              {hasAccessToPremium && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-gradient-to-r from-yellow-100 to-purple-100 rounded-lg">
                  <Crown className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-gray-800">
                    {isAdmin ? '👑 ACESSO ADMIN' : '🏢 PLANO ENTERPRISE'} - Funcionalidades Premium Ativas
                  </span>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
              )}
            </div>
            
            {/* Premium Features Quick Access - Sempre visível para teste */}
            {hasAccessToPremium && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    console.log('🎨 Clicando em Templates Exclusivos');
                    setShowExclusiveTemplates(!showExclusiveTemplates);
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-white font-semibold"
                  size="default"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Templates Exclusivos
                  <Crown className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={() => {
                    console.log('📊 Clicando em Analytics Avançados');
                    setShowAdvancedAnalytics(!showAdvancedAnalytics);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
                  size="default"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics Avançados
                  <Crown className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={() => {
                    console.log('🎯 Clicando em Todas as Funcionalidades');
                    setShowAllPremiumFeatures(!showAllPremiumFeatures);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
                  size="default"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Todas as Funcionalidades
                  <Crown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Message for NON-Premium users */}
        {!hasAccessToPremium && (
          <div className="mb-8">
            <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
              <CardContent className="p-8 text-center">
                <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-3 text-gray-600">Funcionalidades Premium</h3>
                <p className="text-gray-500 mb-4 text-lg">
                  Templates exclusivos e analytics avançados disponíveis apenas para usuários Enterprise e Admins.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-700 font-medium">
                    Seu plano atual: {getPlanDisplayName() || 'N/A'}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Faça upgrade para Enterprise para desbloquear todas as funcionalidades
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Features Showcase - SEMPRE VISÍVEL para usuários premium */}
        {hasAccessToPremium && (
          <div className="mb-8 space-y-6">
            <div className="bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 p-1 rounded-xl">
              <div className="bg-white p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  ÁREA PREMIUM ENTERPRISE
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </h2>
              </div>
            </div>

            {/* Exclusive Templates Section */}
            {showExclusiveTemplates && (
              <Card className="shadow-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-purple-50">
                <CardHeader className="bg-gradient-to-r from-yellow-400 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="w-6 h-6" />
                    Templates Exclusivos Enterprise
                    <Crown className="w-6 h-6" />
                    <div className="ml-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowExclusiveTemplates(false)}
                        className="bg-white text-purple-600 hover:bg-gray-100"
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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
              <Card className="shadow-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="w-6 h-6" />
                    Analytics Avançados Enterprise
                    <Crown className="w-6 h-6" />
                    <div className="ml-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAdvancedAnalytics(false)}
                        className="bg-white text-blue-600 hover:bg-gray-100"
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AdvancedAnalytics />
                </CardContent>
              </Card>
            )}

            {/* All Premium Features Section */}
            {showAllPremiumFeatures && (
              <Card className="shadow-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Palette className="w-6 h-6" />
                    Todas as Funcionalidades Premium
                    <Crown className="w-6 h-6" />
                    <div className="ml-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAllPremiumFeatures(false)}
                        className="bg-white text-green-600 hover:bg-gray-100"
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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

            {/* Premium Features Overview Cards - Sempre visível quando nenhuma seção está aberta */}
            {!showExclusiveTemplates && !showAdvancedAnalytics && !showAllPremiumFeatures && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-purple-50 hover:scale-105"
                  onClick={() => {
                    console.log('🎨 Card Templates clicado');
                    setShowExclusiveTemplates(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                      Templates Exclusivos
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      🎨 6 templates únicos e exclusivos para seu negócio
                    </p>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🎨 Botão Templates clicado');
                        setShowExclusiveTemplates(true);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-white font-semibold"
                      size="default"
                    >
                      Explorar Templates
                    </Button>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:scale-105"
                  onClick={() => {
                    console.log('📊 Card Analytics clicado');
                    setShowAdvancedAnalytics(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                      Analytics Avançados
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      📊 Relatórios detalhados e insights do seu negócio
                    </p>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('📊 Botão Analytics clicado');
                        setShowAdvancedAnalytics(true);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
                      size="default"
                    >
                      Ver Analytics
                    </Button>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:scale-105"
                  onClick={() => {
                    console.log('🎯 Card Todas Funcionalidades clicado');
                    setShowAllPremiumFeatures(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Archive className="w-6 h-6 text-green-500" />
                      Todas as Funcionalidades
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      🎯 Acesso completo a todas as funcionalidades premium
                    </p>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🎯 Botão Todas Funcionalidades clicado');
                        setShowAllPremiumFeatures(true);
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
                      size="default"
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
