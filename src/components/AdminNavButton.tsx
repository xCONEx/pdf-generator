
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface AdminNavButtonProps {
  onAdminPanel?: () => void;
}

const AdminNavButton = ({ onAdminPanel }: AdminNavButtonProps) => {
  return (
    <div className="flex space-x-2">
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
