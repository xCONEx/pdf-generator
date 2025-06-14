
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Settings } from 'lucide-react';

interface AdminNavButtonProps {
  onAdminPanel?: () => void;
}

const AdminNavButton = ({ onAdminPanel }: AdminNavButtonProps) => {
  const navigate = useNavigate();

  const goToSalesPage = () => {
    navigate('/vendas');
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
      {onAdminPanel && (
        <Button
          variant="default"
          size="sm"
          onClick={onAdminPanel}
          className="flex items-center space-x-2"
        >
          <Settings size={16} />
          <span>Painel Admin</span>
        </Button>
      )}
    </div>
  );
};

export default AdminNavButton;
