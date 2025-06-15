
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from './LoginForm';
import AdminPanel from './AdminPanel';
import AdminNavButton from './AdminNavButton';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
}

const ADMIN_EMAILS = ['adm.financeflow@gmail.com', 'yuriadrskt@gmail.com'];

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    console.log('🔄 AuthGuard: Initializing...');
    
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔄 AuthGuard: Session check:', session?.user?.email || 'no user');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthGuard: Auth state change:', event, session?.user?.email || 'no user');
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  // Se é admin e quer ver o painel admin
  if (isAdmin && showAdminPanel) {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowAdminPanel(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Voltar
          </button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  // Se é admin mas não está no painel admin, mostrar o app com botão para admin
  if (isAdmin) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <AdminNavButton onAdminPanel={() => setShowAdminPanel(true)} />
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Sair
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Para usuários não-admin, renderizar os children normalmente com botão de logout
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
        >
          Sair
        </button>
      </div>
      {children}
    </>
  );
};

export default AuthGuard;
