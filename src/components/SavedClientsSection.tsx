
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Phone, Mail, MapPin, Trash2 } from 'lucide-react';
import { useSavedClients } from '@/hooks/useSavedClients';
import { ClientInfo } from '@/types/budget';

interface SavedClientsSectionProps {
  onSelectClient: (client: ClientInfo) => void;
}

const SavedClientsSection = ({ onSelectClient }: SavedClientsSectionProps) => {
  const { savedClients, loading, deleteClient } = useSavedClients();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <User className="w-5 h-5 mr-2" />
            Clientes Salvos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <User className="w-5 h-5 mr-2" />
            Clientes Salvos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Nenhum cliente salvo ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <User className="w-5 h-5 mr-2" />
          Clientes Salvos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {savedClients.map((client, index) => (
            <div 
              key={index} 
              className="p-3 border rounded-lg hover:border-orange-300 transition-colors"
            >
              {/* Layout Desktop - flex row */}
              <div className="hidden md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <User className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                    <h4 className="font-medium text-gray-900 truncate">{client.name}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {client.email && (
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => onSelectClient(client)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Usar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteClient(client)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Layout Mobile - flex column */}
              <div className="md:hidden">
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                    <h4 className="font-medium text-gray-900 break-words">{client.name}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {client.email && (
                      <div className="flex items-start">
                        <Mail className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-all">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="break-all">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-start">
                        <MapPin className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    size="sm"
                    onClick={() => onSelectClient(client)}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                  >
                    Usar Cliente
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteClient(client)}
                    className="px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedClientsSection;
