
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from './LoginForm';
import AdminPanel from './AdminPanel';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
}

interface UserLicense {
  id: string;
  user_id: string;
  plan: 'basic' | 'premium';
  status: 'active' | 'expired' | 'suspended';
  expires_at: string;
  pdfs_generated: number;
  pdf_limit: number;
  created_at: string;
}

const ADMIN_EMAILS = ['adm.financeflow@gmail.com', 'yuriadrskt@gmail.com'];

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [license, setLicense] = useState<UserLicense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserLicense(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkUserLicense(session.user.id);
        } else {
          setLicense(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserLicense = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_licenses')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao verificar licença:', error);
        setLicense(null);
      } else if (data) {
        // Cast the database result to our expected types
        const typedLicense: UserLicense = {
          ...data,
          plan: data.plan as 'basic' | 'premium',
          status: data.status as 'active' | 'expired' | 'suspended'
        };
        setLicense(typedLicense);
      }
    } catch (error) {
      console.error('Erro na verificação de licença:', error);
      setLicense(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Verificar se é admin
  if (user.email && ADMIN_EMAILS.includes(user.email)) {
    return <AdminPanel />;
  }

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

  return <>{children}</>;
};

export default AuthGuard;
