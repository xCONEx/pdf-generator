
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

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

interface UserDashboardProps {
  user: User;
  license: UserLicense;
}

const UserDashboard = ({ user, license }: UserDashboardProps) => {
  const [stats, setStats] = useState({
    totalPdfs: 0,
    thisMonth: 0,
    lastLogin: '',
  });

  useEffect(() => {
    loadUserStats();
  }, [user.id]);

  const loadUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_generations')
        .select('created_at')
        .eq('user_id', user.id);

      if (!error && data) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const thisMonth = data.filter(
          (item) => item.created_at && new Date(item.created_at) >= startOfMonth
        ).length;

        setStats({
          totalPdfs: data.length,
          thisMonth,
          lastLogin: new Date().toLocaleDateString('pt-BR'),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const planName = license.plan === 'basic' ? 'Básico' : 'Premium';
  const planColor = license.plan === 'basic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Olá, {user.email}
          </h2>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Sair
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Plano Atual</h3>
          <div className="mt-1">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${planColor}`}>
              {planName}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">PDFs Gerados</h3>
          <p className="text-2xl font-bold text-gray-900">
            {license.pdfs_generated}/{license.pdf_limit}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Este Mês</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Ativo
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Licença válida até: {new Date(license.expires_at).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ID da Licença: {license.id.slice(-8)}
            </p>
          </div>
          
          {license.plan === 'basic' && (
            <Button variant="outline" size="sm">
              Fazer Upgrade
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
