import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Download, Save, Users } from 'lucide-react';
import { BudgetData, ServiceItem, COLOR_THEMES, CompanyInfo, ClientInfo } from '@/types/budget';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import AdminNavButton from './AdminNavButton';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useSavedClients } from '@/hooks/useSavedClients';
import { useBudgetSaver } from '@/hooks/useBudgetSaver';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import SavedClientsSection from './SavedClientsSection';

// Funções de formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const parseCurrency = (value: string): number => {
  // Remove R$, espaços e converte vírgula para ponto
  const cleanValue = value
    .replace(/R\$\s*/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const formatCurrencyInput = (value: number): string => {
  if (value === 0) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const handleCurrencyInputChange = (value: string, callback: (value: number) => void) => {
  // Remove R$, espaços e pontos, mantém apenas vírgula
  const cleanValue = value
    .replace(/R\$\s*/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  const finalValue = isNaN(parsed) ? 0 : parsed;
  
  callback(finalValue);
};

// Componente para input de moeda
const CurrencyInput = ({ 
  value, 
  onChange, 
  placeholder = "R$ 0,00",
  className = ""
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(formatCurrencyInput(value));

  useEffect(() => {
    setDisplayValue(formatCurrencyInput(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Se o campo está vazio, permite digitar
    if (inputValue === '' || inputValue === 'R$ ') {
      setDisplayValue(inputValue);
      onChange(0);
      return;
    }

    // Remove caracteres não numéricos exceto vírgula
    const cleanValue = inputValue.replace(/[^\d,]/g, '');
    
    if (cleanValue === '') {
      setDisplayValue('R$ 0,00');
      onChange(0);
      return;
    }

    // Se não tem vírgula, adiciona duas casas decimais
    if (!cleanValue.includes(',')) {
      const number = parseInt(cleanValue) || 0;
      const formatted = `R$ ${number.toLocaleString('pt-BR')},00`;
      setDisplayValue(formatted);
      onChange(number);
      return;
    }

    // Se tem vírgula, formata corretamente
    const parts = cleanValue.split(',');
    const integerPart = parts[0] || '0';
    const decimalPart = parts[1] || '00';
    
    // Limita casas decimais a 2
    const formattedDecimal = decimalPart.slice(0, 2).padEnd(2, '0');
    
    // Formata parte inteira com pontos
    const formattedInteger = parseInt(integerPart).toLocaleString('pt-BR');
    
    const formatted = `R$ ${formattedInteger},${formattedDecimal}`;
    setDisplayValue(formatted);
    
    // Converte para número
    const numericValue = parseFloat(`${integerPart}.${formattedDecimal}`);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Garante formatação correta ao sair do campo
    setDisplayValue(formatCurrencyInput(value));
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};

const BudgetForm = () => {
  const { companyProfile, loading: loadingCompany, saveCompanyProfile } = useCompanyProfile();
  const { savedClients, loading: loadingClients, saveClient, deleteClient } = useSavedClients();
  const { saveBudgetToDatabase } = useBudgetSaver();
  const { license, canGeneratePDF, incrementPdfCount } = useLicenseValidation();
  
  const [budgetData, setBudgetData] = useState<BudgetData>({
    companyInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    specialConditions: 'Pagamento em até 30 dias após aprovação do orçamento.',
    observations: 'Estamos à disposição para esclarecimentos adicionais.',
    colorTheme: 'blue',
    validityDays: 30,
    discount: 0
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showClientModal, setShowClientModal] = useState(false);

  // Carregar dados da empresa quando disponível
  useEffect(() => {
    if (companyProfile) {
      setBudgetData(prev => ({ 
        ...prev, 
        companyInfo: companyProfile 
      }));
      if (companyProfile.logoUrl) {
        setLogoPreview(companyProfile.logoUrl);
      }
    }
  }, [companyProfile]);

  // Verificar se o usuário pode personalizar cores (Premium+ apenas)
  const canCustomizeColors = license && (license.plan === 'premium' || license.plan === 'enterprise');

  const handleSaveCompanyData = () => {
    saveCompanyProfile(budgetData.companyInfo);
  };

  const handleSaveClient = () => {
    saveClient(budgetData.clientInfo);
  };

  const loadClient = (client: ClientInfo) => {
    setBudgetData(prev => ({ ...prev, clientInfo: client }));
    setShowClientModal(false);
    toast({
      title: "Cliente Carregado!",
      description: "Dados do cliente foram carregados no formulário.",
    });
  };

  const handleDeleteClient = (client: ClientInfo) => {
    deleteClient(client);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setBudgetData(prev => ({
          ...prev,
          companyInfo: { ...prev.companyInfo, logo: file, logoUrl: result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    const newId = (budgetData.items.length + 1).toString();
    setBudgetData(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    setBudgetData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof ServiceItem, value: string | number) => {
    setBudgetData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateSubtotal = () => {
    return budgetData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (subtotal * budgetData.discount / 100);
  };

  const handleGeneratePDF = async () => {
    if (!canGeneratePDF) {
      toast({
        title: "Limite Atingido",
        description: "Você atingiu o limite de PDFs do seu plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Gerando PDF com dados:', budgetData);
      
      // Primeiro salvar no banco de dados
      await saveBudgetToDatabase(budgetData);
      
      // Incrementar contador
      await incrementPdfCount();
      
      // Depois gerar o PDF
      await generatePDF(budgetData);
      
      toast({
        title: "PDF Gerado com Sucesso!",
        description: "Seu orçamento foi salvo e o PDF está sendo baixado.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao Gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const currentTheme = COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES];

  if (loadingCompany || loadingClients) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Responsivo */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="text-center flex-1">
            <h1 className={`text-2xl sm:text-4xl font-bold bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent mb-2`}>
              Gerador de Orçamentos
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Crie orçamentos profissionais e personalizados em PDF</p>
          </div>
          <AdminNavButton />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Formulário */}
          <div className="space-y-4 sm:space-y-6">
            {/* Informações da Empresa */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0" style={{ color: currentTheme.primary }}>
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Dados da Empresa
                  </div>
                  <Button onClick={handleSaveCompanyData} size="sm" variant="outline" className="w-full sm:w-auto">
                    <Save className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Salvar</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo upload */}
                <div>
                  <Label className="text-sm">Logo da Empresa</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="max-h-20 sm:max-h-28 max-w-full object-contain"
                          style={{ maxWidth: '200px', maxHeight: '112px' }}
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs sm:text-sm text-gray-500">Clique para fazer upload do logo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Nome da Empresa</Label>
                  <Input
                    value={budgetData.companyInfo.name}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, name: e.target.value }
                    }))}
                    placeholder="Digite o nome da empresa"
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <Input
                      type="email"
                      value={budgetData.companyInfo.email}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, email: e.target.value }
                      }))}
                      placeholder="empresa@email.com"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Telefone</Label>
                    <Input
                      value={budgetData.companyInfo.phone}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, phone: e.target.value }
                      }))}
                      placeholder="(11) 99999-9999"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Endereço</Label>
                  <Textarea
                    value={budgetData.companyInfo.address}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, address: e.target.value }
                    }))}
                    placeholder="Endereço completo da empresa"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tema de Cores - Apenas para Premium+ */}
            {canCustomizeColors && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle style={{ color: currentTheme.primary }} className="text-sm sm:text-base">
                    Escolha o Tema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                    {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => setBudgetData(prev => ({ ...prev, colorTheme: key }))}
                        className={`w-full h-8 sm:h-12 rounded-lg border-2 transition-all ${
                          budgetData.colorTheme === key ? 'border-gray-800 scale-105' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: theme.primary }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dados do Cliente */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0" style={{ color: currentTheme.primary }}>
                  <span className="text-sm sm:text-base">Dados do Cliente</span>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowClientModal(true)} size="sm" variant="outline" className="flex-1 sm:flex-none">
                      <Users className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Carregar</span>
                    </Button>
                    <Button onClick={handleSaveClient} size="sm" variant="outline" className="flex-1 sm:flex-none">
                      <Save className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Salvar</span>
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Nome do Cliente</Label>
                  <Input
                    value={budgetData.clientInfo.name}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, name: e.target.value }
                    }))}
                    placeholder="Nome completo ou empresa"
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <Input
                      type="email"
                      value={budgetData.clientInfo.email}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo, email: e.target.value }
                      }))}
                      placeholder="cliente@email.com"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Telefone</Label>
                    <Input
                      value={budgetData.clientInfo.phone}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo, phone: e.target.value }
                      }))}
                      placeholder="(11) 99999-9999"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Endereço</Label>
                  <Textarea
                    value={budgetData.clientInfo.address}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, address: e.target.value }
                    }))}
                    placeholder="Endereço do cliente"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Itens e Configurações */}
          <div className="space-y-4 sm:space-y-6">
            {/* Itens do Orçamento */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0" style={{ color: currentTheme.primary }}>
                  <span className="text-sm sm:text-base">Itens do Orçamento</span>
                  <Button onClick={addItem} size="sm" style={{ backgroundColor: currentTheme.primary }} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetData.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label className="text-xs sm:text-sm font-medium">Item {item.id}</Label>
                      {budgetData.items.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1 sm:p-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descrição do produto/serviço"
                        className="text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Qtd</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Preço Unit.</Label>
                        <CurrencyInput
                          value={item.unitPrice}
                          onChange={(value) => updateItem(item.id, 'unitPrice', value)}
                          placeholder="R$ 0,00"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input
                          value={`R$ ${item.total.toFixed(2)}`}
                          readOnly
                          className="bg-gray-50 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">Subtotal:</span>
                    <span className="font-bold text-sm">R$ {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-xs sm:text-sm">Desconto (%):</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={budgetData.discount === 0 ? '' : budgetData.discount}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-16 sm:w-20 text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-between items-center text-base sm:text-lg font-bold" style={{ color: currentTheme.primary }}>
                    <span>Total Final:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: currentTheme.primary }} className="text-sm sm:text-base">
                  Condições e Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Condições Especiais</Label>
                  <Textarea
                    value={budgetData.specialConditions}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, specialConditions: e.target.value }))}
                    rows={3}
                    placeholder="Condições de pagamento, prazo de entrega, etc."
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">Observações Adicionais</Label>
                  <Textarea
                    value={budgetData.observations}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, observations: e.target.value }))}
                    rows={3}
                    placeholder="Informações extras, garantias, etc."
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">Validade do Orçamento (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={budgetData.validityDays}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botão Gerar PDF */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={!canGeneratePDF}
                  className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Gerar PDF do Orçamento
                </Button>
                {!canGeneratePDF && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    Limite de PDFs atingido
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Clientes Salvos */}
      {showClientModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
      <div className="overflow-y-auto p-4 flex-1">
        <SavedClientsSection onSelectClient={loadClient} />
      </div>
      <div className="p-4 border-t">
        <Button
          onClick={() => setShowClientModal(false)}
          variant="outline"
          className="w-full"
        >
          Fechar
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default BudgetForm;
