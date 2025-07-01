
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface AddMemberFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMemberForm = ({ onClose, onSuccess }: AddMemberFormProps) => {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getPdfLimit = (planType: string) => {
    switch (planType) {
      case 'basic':
        return 10;
      case 'premium':
        return 50;
      case 'enterprise':
        return 999999; // Ilimitado
      default:
        return 10;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar se já existe uma licença para este email
      const { data: existingLicense } = await supabase
        .from('user_licenses')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingLicense) {
        toast({
          title: 'Erro',
          description: 'Este email já possui uma licença',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Criar nova licença
      const { error } = await supabase
        .from('user_licenses')
        .insert({
          email,
          user_id: null,
          plan,
          status: 'active',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          pdf_limit: getPdfLimit(plan),
          pdfs_generated: 0,
        });

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Membro adicionado com sucesso',
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar membro. Verifique as permissões.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Adicionar Novo Membro</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
              Plano
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="basic">Básico (10 PDFs) - R$ 19,90</option>
              <option value="premium">Profissional (50 PDFs) - R$ 39,90</option>
              <option value="enterprise">Empresarial (Ilimitado) - R$ 59,90</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberForm;
