
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, Trash2, FileText, Calendar, User } from 'lucide-react';
import { useState } from 'react';

interface BackupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BackupModal = ({ open, onOpenChange }: BackupModalProps) => {
  const [selectedBackups, setSelectedBackups] = useState<string[]>([]);

  // Dados simulados de backups
  const savedBudgets = [
    {
      id: '1',
      clientName: 'Empresa ABC Ltda',
      budgetTitle: 'Sistema de Gestão',
      value: 15500.00,
      createdAt: '2024-06-15',
      items: 8,
      status: 'Finalizado'
    },
    {
      id: '2',
      clientName: 'Startup Tech',
      budgetTitle: 'Desenvolvimento Mobile',
      value: 28750.00,
      createdAt: '2024-06-14',
      items: 12,
      status: 'Rascunho'
    },
    {
      id: '3',
      clientName: 'Consultoria XYZ',
      budgetTitle: 'Auditoria de Sistemas',
      value: 8900.00,
      createdAt: '2024-06-13',
      items: 5,
      status: 'Enviado'
    },
    {
      id: '4',
      clientName: 'E-commerce 123',
      budgetTitle: 'Loja Virtual',
      value: 42300.00,
      createdAt: '2024-06-12',
      items: 15,
      status: 'Aprovado'
    },
    {
      id: '5',
      clientName: 'Indústria Beta',
      budgetTitle: 'Automação Industrial',
      value: 67800.00,
      createdAt: '2024-06-11',
      items: 20,
      status: 'Finalizado'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'text-green-600 bg-green-100';
      case 'Enviado': return 'text-blue-600 bg-blue-100';
      case 'Finalizado': return 'text-purple-600 bg-purple-100';
      case 'Rascunho': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSelectBackup = (id: string) => {
    setSelectedBackups(prev => 
      prev.includes(id) 
        ? prev.filter(backupId => backupId !== id)
        : [...prev, id]
    );
  };

  const handleDownloadSelected = () => {
    console.log('Baixando backups selecionados:', selectedBackups);
    // Implementar lógica de download
  };

  const handleDeleteSelected = () => {
    console.log('Deletando backups selecionados:', selectedBackups);
    // Implementar lógica de exclusão
    setSelectedBackups([]);
  };

  const totalValue = savedBudgets.reduce((sum, budget) => sum + budget.value, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-orange-800">
            <Database className="w-6 h-6 mr-2" />
            Backup de Orçamentos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Backups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {savedBudgets.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Selecionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedBackups.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações em lote */}
          {selectedBackups.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleDownloadSelected}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Selecionados ({selectedBackups.length})
                  </Button>
                  <Button 
                    onClick={handleDeleteSelected}
                    variant="destructive"
                    className="flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Selecionados
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Backups */}
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedBudgets.map((budget) => (
                  <div 
                    key={budget.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBackups.includes(budget.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectBackup(budget.id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{budget.budgetTitle}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <User className="w-4 h-4 mr-1" />
                              {budget.clientName}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                            {budget.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {budget.items} itens
                          </div>
                          <div className="font-semibold text-green-600">
                            R$ {budget.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Carregar orçamento:', budget.id);
                          }}
                        >
                          Carregar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Baixar orçamento:', budget.id);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">
                💡 <strong>Dica:</strong> Clique em um orçamento para selecioná-lo. Use as ações em lote para gerenciar múltiplos orçamentos de uma vez.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackupModal;
