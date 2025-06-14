
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, FileText } from 'lucide-react';

const AdminNavButton = () => {
  const navigate = useNavigate();

  const goToSalesPage = () => {
    navigate('/vendas');
  };

  const goToPdfGenerator = () => {
    // Abrir em nova aba para não perder o contexto admin
    window.open('/', '_blank');
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToSalesPage}
        className="flex items-center space-x-2"
      >
        <ExternalLink size={16} />
        <span>Página de Vendas</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={goToPdfGenerator}
        className="flex items-center space-x-2"
      >
        <FileText size={16} />
        <span>Gerador de PDF</span>
      </Button>
    </div>
  );
};

export default AdminNavButton;
