
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminNavButton = () => {
  const navigate = useNavigate();

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/vendas')}
        className="flex items-center space-x-2"
      >
        <span>Ir para PDF</span>
      </Button>
    </div>
  );
};

export default AdminNavButton;
