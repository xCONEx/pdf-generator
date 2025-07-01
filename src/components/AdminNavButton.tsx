
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft } from 'lucide-react';

interface AdminNavButtonProps {
  onAdminPanel?: () => void;
  onBack?: () => void;
}

const AdminNavButton = ({ onAdminPanel, onBack }: AdminNavButtonProps) => {
  return (
    <div className="flex space-x-2">
      {onBack && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </Button>
      )}
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
