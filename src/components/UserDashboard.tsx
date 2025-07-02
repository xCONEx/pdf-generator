import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Crown, FileText, Calendar, Database } from 'lucide-react';
import { useState } from 'react';
import AnalyticsModal from './AnalyticsModal';
import BackupModal from './BackupModal';
import { useNavigate } from 'react-router-dom';

interface UserLicense {
  id: string;
  email: string;
  plan: string;
  status: string;
  expires_at: string;
  pdfs_generated: number;
  pdf_limit: number;
}

interface UserDashboardProps {
  user: User;
  license: UserLicense;
}

const UserDashboard = ({ user, license }: UserDashboardProps) => {
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await import('@/integrations/supabase/client').then(({ supabase }) => supabase.auth.signOut());
    navigate('/');
  };

  const getPlanDisplayName = () => {
    switch (license.plan) {
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Básico';
    }
  };

  const getPlanColor = () => {
    switch (license.plan) {
      case 'premium':
        return 'text-purple-600';
      case 'enterprise':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-end mb-2">
        <Button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-4 py-2 text-sm font-semibold shadow">
          Sair
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Status da Licença */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Plano Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPlanColor()}`}>
              {getPlanDisplayName()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Status: {license.status === 'active' ? 'Ativo' : 'Inativo'}
            </p>
          </CardContent>
        </Card>

        {/* PDFs Gerados */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              PDFs Gerados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {license.pdfs_generated}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Limite: {license.pdf_limit === 999999 ? 'Ilimitado' : license.pdf_limit}
            </p>
          </CardContent>
        </Card>

        {/* Validade */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Validade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-gray-800">
              {new Date(license.expires_at).toLocaleDateString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Expira em
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Funcionalidades - apenas para planos premium/enterprise */}
      {(license.plan === 'premium' || license.plan === 'enterprise') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Analytics Avançados */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics Dashboard
                <Crown className="w-4 h-4 ml-2 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-4">
                Relatórios detalhados e insights do seu negócio
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setAnalyticsModalOpen(true)}
              >
                Ver Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Backup de Orçamentos */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <Database className="w-5 h-5 mr-2" />
                Backup de Orçamentos
                <Crown className="w-4 h-4 ml-2 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700 mb-4">
                Salve e gerencie seus orçamentos
              </p>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setBackupModalOpen(true)}
              >
                Gerenciar Backups
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modais */}
      <AnalyticsModal 
        open={analyticsModalOpen} 
        onOpenChange={setAnalyticsModalOpen} 
      />
      <BackupModal 
        open={backupModalOpen} 
        onOpenChange={setBackupModalOpen} 
      />
    </div>
  );
};

export default UserDashboard;
