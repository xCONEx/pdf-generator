import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, Download, Trash2, FileText, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import { useSavedBudgets } from '@/hooks/useSavedBudgets';

interface BackupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BackupModal = ({ open, onOpenChange }: BackupModalProps) => {
  const { savedBudgets, loading, deleteBudgets, loadBudget } = useSavedBudgets();
  const [selectedBackups, setSelectedBackups] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'text-green-600 bg-green-100';
      case 'Enviado': return 'text-blue-600 bg-blue-100';
      case 'Rejeitado': return 'text-red-600 bg-red-100';
      case 'Finalizado': return 'text-purple-600 bg-purple-100';
      default: return 'text-yellow-600 bg-yellow-100';
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
    // TODO: Implementar lógica de download
  };

  const handleDeleteSelected = async () => {
    if (selectedBackups.length === 0) return;
    
    await deleteBudgets(selectedBackups);
    setSelectedBackups([]);
  };

  const handleDeleteSingle = async (budgetId: string) => {
    await deleteBudgets([budgetId]);
  };

  const handleLoadBudget = async (budgetId: string) => {
    await loadBudget(budgetId);
  };

  const totalValue = savedBudgets.reduce((sum, budget) => sum + budget.finalValue, 0);

  if (loading) {
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              {savedBudgets.length > 0 ? (
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
                              R$ {budget.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadBudget(budget.id);
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
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSingle(budget.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum orçamento salvo encontrado.
                </p>
              )}
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
