import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemStatus {
  database: 'online' | 'offline' | 'error';
  webhook: 'online' | 'offline' | 'error';
  auth: 'online' | 'offline' | 'error';
  licenseSystem: 'online' | 'offline' | 'error';
  lastCheck: Date;
}

const SystemStatusMonitor = () => {
  const [status, setStatus] = useState<SystemStatus>({
    database: 'offline',
    webhook: 'offline',
    auth: 'offline',
    licenseSystem: 'offline',
    lastCheck: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  const checkSystemStatus = async () => {
    setLoading(true);
    const newStatus: SystemStatus = {
      database: 'offline',
      webhook: 'offline',
      auth: 'offline',
      licenseSystem: 'offline',
      lastCheck: new Date()
    };

    try {
      // Testar conexão com banco de dados
      const { data: dbTest, error: dbError } = await supabase
        .from('user_licenses')
        .select('count')
        .limit(1);

      if (dbError) {
        console.error('Erro no banco de dados:', dbError);
        newStatus.database = 'error';
      } else {
        newStatus.database = 'online';
      }

      // Testar sistema de autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Erro na autenticação:', authError);
        newStatus.auth = 'error';
      } else {
        newStatus.auth = 'online';
      }

      // Testar sistema de licenças
      try {
        await supabase.rpc('check_expired_licenses');
        newStatus.licenseSystem = 'online';
      } catch (licenseError) {
        console.error('Erro no sistema de licenças:', licenseError);
        newStatus.licenseSystem = 'error';
      }

      // Testar webhook (simulado)
      try {
        // Testar se a Edge Function está acessível
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://linxpynrwpqokugizynm.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/cakto-webhook`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 08f50a3f-44c8-444d-98ad-3e8cd2e94957'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            product_name: 'Test Product',
            status: 'test'
          })
        });
        
        // 401/403 são esperados pois estamos enviando dados de teste inválidos
        // mas o webhook está respondendo, então está online
        if (response.status === 401 || response.status === 403) {
          console.log('Webhook online - rejeitou dados de teste (esperado)');
          newStatus.webhook = 'online';
        } else if (response.ok) {
          console.log('Webhook online - aceitou dados de teste');
          newStatus.webhook = 'online';
        } else if (response.status >= 500) {
          console.error('Webhook offline - erro do servidor:', response.status);
          newStatus.webhook = 'offline';
        } else {
          console.log('Webhook online - status:', response.status);
          newStatus.webhook = 'online';
        }
      } catch (webhookError) {
        console.error('Erro ao testar webhook:', webhookError);
        newStatus.webhook = 'offline';
      }

      setStatus(newStatus);

      // Verificar logs de webhook recentes
      const { data: recentPurchases } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setWebhookLogs(recentPurchases || []);

    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar status do sistema',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
      case 'error':
        return <Badge className="bg-yellow-100 text-yellow-800">Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status do Sistema</span>
            <Button
              onClick={checkSystemStatus}
              disabled={loading}
              className="text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.database)}
              <div>
                <p className="text-sm font-medium">Banco de Dados</p>
                {getStatusBadge(status.database)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.auth)}
              <div>
                <p className="text-sm font-medium">Autenticação</p>
                {getStatusBadge(status.auth)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.licenseSystem)}
              <div>
                <p className="text-sm font-medium">Sistema de Licenças</p>
                {getStatusBadge(status.licenseSystem)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(status.webhook)}
              <div>
                <p className="text-sm font-medium">Webhook Cakto</p>
                {getStatusBadge(status.webhook)}
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Última verificação: {status.lastCheck.toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      {/* Logs de Webhook */}
      {webhookLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logs Recentes do Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {webhookLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{log.email}</p>
                    <p className="text-xs text-gray-500">
                      {log.product_name} - {log.plan}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={log.payment_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {log.payment_status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemStatusMonitor; 