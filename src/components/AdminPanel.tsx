
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Plus, FileText, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddMemberForm from './AddMemberForm';
import EditPlanForm from './EditPlanForm';

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

  const goToPdfGenerator = () => {
    // Recarregar a página para voltar ao gerador
    window.location.href = '/';
  };

  const goToSalesPage = () => {
    navigate('/vendas');
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
                size="sm"
              >
                <Plus size={14} />
                <span>Adicionar Membro</span>
              </Button>
<a
  href="https://orcafacilpdf.vercel.app"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button
    className="flex items-center justify-center space-x-2 text-xs sm:text-sm h-8 sm:h-9"
    size="sm"
  >
    <ArrowRight size={14} />
    <span>Página de Vendas</span>
  </Button>
</a>
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
