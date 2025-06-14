
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminNavButton = () => {
  const navigate = useNavigate();

  const goToMainApp = () => {
    navigate('/');
  };

  return (
    <Button
      onClick={goToMainApp}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      <span>Ir para PDF</span>
      <ArrowRight size={16} />
    </Button>
  );
};

export default AdminNavButton;
