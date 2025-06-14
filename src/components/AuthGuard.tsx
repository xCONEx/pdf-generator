
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoginForm from './LoginForm';
import AdminPanel from './AdminPanel';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
}

const ADMIN_EMAILS = ['adm.financeflow@gmail.com', 'yuriadrskt@gmail.com'];

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Verificar se é admin - se for, mostrar painel admin
  if (user.email && ADMIN_EMAILS.includes(user.email)) {
    return <AdminPanel />;
  }

  // Para usuários não-admin, renderizar os children (que incluem a verificação de licença)
  return <>{children}</>;
};

export default AuthGuard;
