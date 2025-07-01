
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
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
        <div className="fixed top-4 right-4 z-50">
          <AdminNavButton onBack={() => setShowAdminPanel(false)} />
        </div>
        <AdminPanel />
      </div>
    );
  }

  // Se é admin mas não está no painel admin, mostrar o gerador com botão para admin
  if (isAdmin) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <AdminNavButton onAdminPanel={() => setShowAdminPanel(true)} />
        </div>
        {children}
      </div>
    );
  }

  // Para usuários não-admin, renderizar os children normalmente
  return <>{children}</>;
};

export default AuthGuard;
