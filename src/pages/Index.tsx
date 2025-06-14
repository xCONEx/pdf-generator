
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/vendas', '_blank')}
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
