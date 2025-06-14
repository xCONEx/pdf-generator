
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const AdminNavButton = () => {
  const goToAdminPanel = () => {
    window.location.reload();
  };

  return (
    <Button
      onClick={goToAdminPanel}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      <span>Painel Admin</span>
      <ArrowRight size={16} />
    </Button>
  );
};

export default AdminNavButton;
