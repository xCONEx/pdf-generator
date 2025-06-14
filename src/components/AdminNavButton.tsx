
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminNavButton = () => {
  const navigate = useNavigate();

  const goToSalesPage = () => {
    window.open('/vendas.html', '_blank');
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToSalesPage}
        className="flex items-center space-x-2"
      >
        <span>Ir para Vendas</span>
      </Button>
    </div>
  );
};

export default AdminNavButton;
