
import BudgetForm from '@/components/BudgetForm';
import UserDashboard from '@/components/UserDashboard';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Crown } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const { license, loading, getPlanDisplayName } = useLicenseValidation();

  // Check if user is admin
  const isAdmin = user?.email === 'adm.financeflow@gmail.com' || user?.email === 'yuriadrskt@gmail.com';
  const isEnterprise = license?.plan === 'enterprise';
  const hasAccessToPremium = isEnterprise || isAdmin;

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
        
        {user && license && (
          <UserDashboard user={user} license={license} />
        )}
        <BudgetForm />
      </div>
    </div>
  );
};

export default Index;
