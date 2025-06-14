import BudgetForm from '@/components/BudgetForm';
import UserDashboard from '@/components/UserDashboard';
import AdminNavButton from '@/components/AdminNavButton';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const ADMIN_EMAILS = ['adm.financeflow@gmail.com', 'yuriadrskt@gmail.com'];

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const { license, loading } = useLicenseValidation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

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
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  // Verificar limite de PDFs
  if (license.pdfs_generated >= license.pdf_limit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            Limite de PDFs Atingido
          </h2>
          <p className="text-gray-600 mb-6">
            Você atingiu o limite de {license.pdf_limit} PDFs para seu plano {license.plan}.
            Faça upgrade para continuar gerando orçamentos.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              PDFs gerados: {license.pdfs_generated}/{license.pdf_limit}
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/vendas.html', '_blank')}
            className="flex items-center space-x-2"
          >
            <span>Página de Vendas</span>
            <ExternalLink size={16} />
          </Button>
          
          {isAdmin && <AdminNavButton />}
        </div>
        
        {user && license && (
          <UserDashboard user={user} license={license} />
        )}
        <BudgetForm />
      </div>
    </div>
  );
};

export default Index;
