import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Plus, FileText, Edit, RefreshCw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddMemberForm from './AddMemberForm';
import EditPlanForm from './EditPlanForm';
import SystemStatusMonitor from './SystemStatusMonitor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Purchase {
  id: string;
  email: string;
  product_name: string;
  plan: string;
  amount: number;
  payment_status: string;
  created_at: string;
}

interface UserLicense {
  id: string;
  email: string;
  plan: string;
  status: string;
  expires_at: string;
  pdfs_generated: number;
  pdf_limit: number;
}

const AdminPanel = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [licenses, setLicenses] = useState<UserLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingLicense, setEditingLicense] = useState<UserLicense | null>(null);
  const [showWebhookTest, setShowWebhookTest] = useState(false);
  const [webhookTestData, setWebhookTestData] = useState({
    email: 'teste@exemplo.com',
    product_name: 'Plano Profissional - OrçaFácilPDF',
    product_id: 'premium_plan',
    status: 'approved',
    amount: '39.90',
    transaction_id: `test_${Date.now()}`
  });
  const [webhookTestLoading, setWebhookTestLoading] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAdminData();
    ensureAdminLicenses();
  }, []);

  const ensureAdminLicenses = async () => {
    const adminEmails = ['adm.financeflow@gmail.com', 'yuriadrskt@gmail.com'];
    
    for (const email of adminEmails) {
      try {
        // Verificar se já existe licença
        const { data: existingLicense } = await supabase
          .from('user_licenses')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (!existingLicense) {
          // Criar licença enterprise para admin
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 10); // 10 anos

          const { error } = await supabase
            .from('user_licenses')
            .insert({
              email: email,
              plan: 'enterprise',
              status: 'active',
              expires_at: expiresAt.toISOString(),
              pdf_limit: 999999,
              pdfs_generated: 0
            });

          if (error) {
            console.error('Erro ao criar licença admin:', error);
          } else {
            console.log('Licença admin criada para:', email);
          }
        } else if (existingLicense.plan !== 'enterprise') {
          // Atualizar para enterprise se não for
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 10);

          const { error } = await supabase
            .from('user_licenses')
            .update({
              plan: 'enterprise',
              status: 'active',
              expires_at: expiresAt.toISOString(),
              pdf_limit: 999999
            })
            .eq('id', existingLicense.id);

          if (error) {
            console.error('Erro ao atualizar licença admin:', error);
          } else {
            console.log('Licença admin atualizada para:', email);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar/criar licença admin:', error);
      }
    }
  };

  const loadAdminData = async () => {
    try {
      console.log('Carregando dados administrativos...');
      
      // Carregar licenças primeiro
      const { data: licensesData, error: licensesError } = await supabase
        .from('user_licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (licensesError) {
        console.error('Erro ao carregar licenças:', licensesError);
        throw licensesError;
      }

      console.log('Licenças carregadas:', licensesData);

      // Tentar carregar compras (pode falhar se não houver políticas)
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (purchasesError) {
        console.warn('Erro ao carregar compras (pode ser normal se não há dados):', purchasesError);
        setPurchases([]);
      } else {
        setPurchases(purchasesData || []);
      }

      setLicenses(licensesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados administrativos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLicenseStatus = async (licenseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_licenses')
        .update({ status: newStatus })
        .eq('id', licenseId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Status da licença atualizado',
      });

      loadAdminData();
    } catch (error) {
      console.error('Erro ao atualizar licença:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar licença',
        variant: 'destructive',
      });
    }
  };

  const fixPdfCounters = async () => {
    try {
      const { data: fixedCount, error } = await supabase.rpc('fix_pdf_counters');
      
      if (error) throw error;

      toast({
        title: 'Contadores Corrigidos',
        description: `${fixedCount} contadores foram corrigidos com sucesso.`,
      });

      loadAdminData();
    } catch (error) {
      console.error('Erro ao corrigir contadores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao corrigir contadores de PDFs',
        variant: 'destructive',
      });
    }
  };

  const goToPdfGenerator = () => {
    // Recarregar a página para voltar ao gerador
    window.location.href = '/';
  };

  const goToSalesPage = () => {
    navigate('/vendas');
  };

  const testWebhook = async () => {
    setWebhookTestLoading(true);
    setWebhookTestResult(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://linxpynrwpqokugizynm.supabase.co';
      const webhookKey = '08f50a3f-44c8-444d-98ad-3e8cd2e94957';

      const response = await fetch(`${supabaseUrl}/functions/v1/cakto-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-key': webhookKey
        },
        body: JSON.stringify(webhookTestData)
      });

      const responseData = await response.json();

      setWebhookTestResult({
        status: response.status,
        data: responseData
      });

      if (response.ok) {
        toast({
          title: 'Webhook Testado com Sucesso',
          description: 'O webhook foi processado corretamente',
        });
        loadAdminData(); // Recarregar dados para ver a nova compra
      } else {
        toast({
          title: 'Erro no Webhook',
          description: `Status: ${response.status} - ${responseData.error || 'Erro desconhecido'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      setWebhookTestResult({
        status: 0,
        data: { error: error.message }
      });
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao webhook',
        variant: 'destructive',
      });
    } finally {
      setWebhookTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Painel Administrativo
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Gerenciamento de compras e licenças do sistema
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <Button
                onClick={() => setShowAddMember(true)}
                className="flex items-center justify-center space-x-2 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Plus size={14} />
                <span>Adicionar Membro</span>
              </Button>
              <Button
                onClick={fixPdfCounters}
                className="flex items-center justify-center space-x-2 text-xs sm:text-sm h-8 sm:h-9 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RefreshCw size={14} />
                <span>Corrigir Contadores</span>
              </Button>
              <Button
                onClick={() => setShowWebhookTest(true)}
                className="flex items-center justify-center space-x-2 text-xs sm:text-sm h-8 sm:h-9 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Zap size={14} />
                <span>Testar Webhook</span>
              </Button>
              <Button
                onClick={goToPdfGenerator}
                variant="secondary"
                className="flex items-center justify-center space-x-2 text-xs sm:text-sm h-8 sm:h-9 sm:col-span-2 lg:col-span-1"
                size="sm"
              >
                <FileText size={14} />
                <span>Voltar ao Gerador</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal para adicionar membro */}
        {showAddMember && (
          <AddMemberForm
            onClose={() => setShowAddMember(false)}
            onSuccess={() => {
              setShowAddMember(false);
              loadAdminData();
            }}
          />
        )}

        {/* Modal para editar plano */}
        {editingLicense && (
          <EditPlanForm
            license={editingLicense}
            onClose={() => setEditingLicense(null)}
            onSuccess={() => {
              setEditingLicense(null);
              loadAdminData();
            }}
          />
        )}

        {/* Modal para testar webhook */}
        <Dialog open={showWebhookTest} onOpenChange={setShowWebhookTest}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-purple-800">
                <Zap className="w-6 h-6 mr-2" />
                Testar Webhook da Cakto
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-email">Email do Cliente</Label>
                  <Input
                    id="test-email"
                    value={webhookTestData.email}
                    onChange={(e) => setWebhookTestData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="cliente@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="test-product">Nome do Produto</Label>
                  <Select
                    value={webhookTestData.product_name}
                    onValueChange={(value) => setWebhookTestData(prev => ({ ...prev, product_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plano Básico - OrçaFácilPDF">Plano Básico - OrçaFácilPDF</SelectItem>
                      <SelectItem value="Plano Profissional - OrçaFácilPDF">Plano Profissional - OrçaFácilPDF</SelectItem>
                      <SelectItem value="Plano Empresarial - OrçaFácilPDF">Plano Empresarial - OrçaFácilPDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-product-id">ID do Produto</Label>
                  <Select
                    value={webhookTestData.product_id}
                    onValueChange={(value) => setWebhookTestData(prev => ({ ...prev, product_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="33chw64">Plano Básico (33chw64)</SelectItem>
                      <SelectItem value="c4jwped">Plano Profissional (c4jwped)</SelectItem>
                      <SelectItem value="3b6s5eo">Plano Empresarial (3b6s5eo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-status">Status do Pagamento</Label>
                  <Select
                    value={webhookTestData.status}
                    onValueChange={(value) => setWebhookTestData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-amount">Valor</Label>
                  <Input
                    id="test-amount"
                    value={webhookTestData.amount}
                    onChange={(e) => setWebhookTestData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="97.00"
                  />
                </div>
                <div>
                  <Label htmlFor="test-transaction">ID da Transação</Label>
                  <Input
                    id="test-transaction"
                    value={webhookTestData.transaction_id}
                    onChange={(e) => setWebhookTestData(prev => ({ ...prev, transaction_id: e.target.value }))}
                    placeholder="transacao_123"
                  />
                </div>
              </div>

              <div>
                <Label>Payload Completo (JSON)</Label>
                <Textarea
                  value={JSON.stringify(webhookTestData, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setWebhookTestData(parsed);
                    } catch (error) {
                      // Ignorar erro de parsing durante digitação
                    }
                  }}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={testWebhook}
                  disabled={webhookTestLoading}
                  className="flex-1"
                >
                  {webhookTestLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Enviar Teste
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setWebhookTestData({
                      email: 'teste@exemplo.com',
                      product_name: 'Plano Profissional - OrçaFácilPDF',
                      product_id: 'c4jwped',
                      status: 'approved',
                      amount: '39.90',
                      transaction_id: `test_${Date.now()}`
                    });
                    setWebhookTestResult(null);
                  }}
                >
                  Resetar
                </Button>
              </div>

              {webhookTestResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Status HTTP: </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        webhookTestResult.status >= 200 && webhookTestResult.status < 300
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {webhookTestResult.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Resposta: </span>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(webhookTestResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Monitor de Status do Sistema */}
        <SystemStatusMonitor />

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1">Total de Compras</h3>
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900">{purchases.length}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1">Licenças Ativas</h3>
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-green-600">
              {licenses.filter(l => l.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1">Planos Premium</h3>
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-purple-600">
              {licenses.filter(l => l.plan === 'premium').length}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-1">Receita Total</h3>
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-green-600">
              R$ {purchases.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Compras Recentes */}
        {purchases.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 md:mb-8 overflow-hidden">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold">Compras Recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produto
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plano
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs md:text-sm text-gray-900 break-all">
                        {purchase.email}
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs md:text-sm text-gray-900">
                        {purchase.product_name}
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          purchase.plan === 'premium' 
                            ? 'bg-purple-100 text-purple-800' 
                            : purchase.plan === 'enterprise'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {purchase.plan}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs md:text-sm text-gray-900">
                        R$ {(purchase.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          purchase.payment_status === 'approved' || purchase.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {purchase.payment_status}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs md:text-sm text-gray-500">
                        {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gerenciamento de Licenças */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold">Gerenciamento de Licenças</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plano
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PDFs Gerados
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expira em
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {licenses.map((license) => (
                  <tr key={license.id}>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs md:text-sm text-gray-900 break-all">
                      {license.email}
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        license.plan === 'premium' 
                          ? 'bg-purple-100 text-purple-800' 
                          : license.plan === 'enterprise'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {license.plan}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        license.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : license.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs md:text-sm text-gray-900">
                      {license.pdfs_generated}/{license.pdf_limit === 999999 ? '∞' : license.pdf_limit}
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs md:text-sm text-gray-500">
                      {new Date(license.expires_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingLicense(license)}
                          className="flex items-center justify-center space-x-1 text-xs h-7 sm:h-8 px-2"
                        >
                          <Edit size={12} />
                          <span>Editar</span>
                        </Button>
                        {license.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateLicenseStatus(license.id, 'suspended')}
                            className="text-xs h-7 sm:h-8 px-2"
                          >
                            Suspender
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => updateLicenseStatus(license.id, 'active')}
                            className="text-xs h-7 sm:h-8 px-2"
                          >
                            Ativar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
