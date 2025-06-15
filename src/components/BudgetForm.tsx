import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Download, Save, Users, Crown, BarChart3, X, Sparkles, Archive, Palette } from 'lucide-react';
import { BudgetData, ServiceItem, COLOR_THEMES, ClientInfo } from '@/types/budget';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import AdminNavButton from './AdminNavButton';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useSavedClients } from '@/hooks/useSavedClients';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import PremiumFeatures from './premium/PremiumFeatures';
import { PremiumTemplate } from './premium/TemplateSelector';
import { AdvancedCustomizationOptions } from './premium/AdvancedCustomization';
import AdvancedAnalytics from './premium/AdvancedAnalytics';
import PriceInput from './PriceInput';

const BudgetForm = () => {
  const { companyProfile, loading: loadingCompany, saveCompanyProfile } = useCompanyProfile();
  const { savedClients, loading: loadingClients, saveClient, deleteClient } = useSavedClients();
  const { license } = useLicenseValidation();

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
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showAllPremiumFeatures, setShowAllPremiumFeatures] = useState(false);
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState<PremiumTemplate | null>(null);
  const [advancedCustomization, setAdvancedCustomization] = useState<AdvancedCustomizationOptions | null>(null);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

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

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setBudgetData(prev => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, logo: undefined, logoUrl: '' }
    }));
    toast({
      title: "Logo Removido",
      description: "O logo foi removido com sucesso.",
    });
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
    try {
      if (!budgetData.companyInfo.name || !budgetData.clientInfo.name) {
        toast({
          title: "Dados Obrigatórios",
          description: "Preencha os dados da empresa e do cliente antes de gerar o PDF.",
          variant: "destructive",
        });
        return;
      }

      const enhancedBudgetData = {
        ...budgetData,
        premiumTemplate: selectedPremiumTemplate,
      };

      await generatePDF(enhancedBudgetData);
      toast({
        title: "PDF Gerado com Sucesso!",
        description: "Seu orçamento foi gerado e está sendo baixado.",
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

  const getThemeGradient = () => {
    if (advancedCustomization) {
      return `from-[${advancedCustomization.customColors.primary}] to-[${advancedCustomization.customColors.secondary}]`;
    }

    return COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES]?.gradient || 'from-blue-500 to-blue-600';
  };

  const getCurrentThemeColor = () => {
    if (advancedCustomization) {
      return advancedCustomization.customColors.primary;
    }

    if (selectedPremiumTemplate) {
      return selectedPremiumTemplate.colorScheme.primary;
    }

    return COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES]?.primary || '#3B82F6';
  };

  const currentTheme = advancedCustomization 
    ? {
        primary: advancedCustomization.customColors.primary,
        secondary: advancedCustomization.customColors.secondary,
        accent: advancedCustomization.customColors.accent,
        text: advancedCustomization.customColors.text
      }
    : selectedPremiumTemplate
        ? selectedPremiumTemplate.colorScheme
        : COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES];

  const user = null;
  const isAdmin = user?.email === 'adm.financeflow@gmail.com' || user?.email === 'yuriadrskt@gmail.com';
  const isEnterprise = license?.plan === 'enterprise';
  const hasAccessToPremium = isEnterprise || isAdmin;

  if (loadingCompany || loadingClients) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center flex-1">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${getThemeGradient()} bg-clip-text text-transparent mb-2`}>
              Gerador de Orçamentos
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Crie orçamentos profissionais e personalizados em PDF</p>
          </div>
          <div className="flex gap-2">
            <AdminNavButton />
          </div>
        </div>

        {/* CARDS PREMIUM - Responsivos (removido Templates Exclusivos temporariamente) */}
        {hasAccessToPremium && !showAdvancedAnalytics && !showAllPremiumFeatures && (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:scale-105"
                onClick={() => setShowAdvancedAnalytics(true)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    <span className="truncate">Analytics Avançados</span>
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    📊 Relatórios detalhados e insights do seu negócio
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAdvancedAnalytics(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm"
                  >
                    Ver Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:scale-105"
                onClick={() => setShowAllPremiumFeatures(true)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    <span className="truncate">Funcionalidades Premium</span>
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    🎯 Acesso completo a todas as funcionalidades premium
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllPremiumFeatures(true);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-sm"
                  >
                    Acessar Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* SEÇÕES EXPANDIDAS (removido Templates Exclusivos) */}
        {hasAccessToPremium && (
          <div className="mb-6 sm:mb-8 space-y-6">
            {showAdvancedAnalytics && (
              <Card className="shadow-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-lg sm:text-xl">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                      Analytics Avançados Enterprise
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="ml-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAdvancedAnalytics(false)}
                        className="bg-white text-blue-600 hover:bg-gray-100"
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <AdvancedAnalytics />
                </CardContent>
              </Card>
            )}

            {showAllPremiumFeatures && (
              <Card className="shadow-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-lg sm:text-xl">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                      Todas as Funcionalidades Premium
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="ml-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAllPremiumFeatures(false)}
                        className="bg-white text-green-600 hover:bg-gray-100"
                      >
                        Ocultar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <PremiumFeatures
                    onTemplateSelect={(template) => setSelectedPremiumTemplate(template)}
                    onCustomizationChange={(options) => setAdvancedCustomization(options)}
                    onLoadBudget={(budgetData) => setBudgetData(budgetData)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* FORMULÁRIO */}
          <div className="space-y-4 sm:space-y-6">
            {/* Informações da Empresa */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ color: currentTheme.primary }}>
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Dados da Empresa
                  </div>
                  <Button onClick={handleSaveCompanyData} size="sm" variant="outline">
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Salvar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo upload */}
                <div>
                  <Label>Logo da Empresa</Label>
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
                      className="flex items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors relative"
                      onMouseEnter={() => setIsHoveringLogo(true)}
                      onMouseLeave={() => setIsHoveringLogo(false)}
                    >
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="max-h-24 sm:max-h-28 max-w-full object-contain"
                            style={{ maxWidth: '200px', maxHeight: '112px' }}
                          />
                          {isHoveringLogo && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveLogo();
                                }}
                                className="flex items-center gap-1"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                Remover
                              </Button>
                            </div>
                          )}
                        </div>
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
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={budgetData.companyInfo.name}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, name: e.target.value }
                    }))}
                    placeholder="Digite o nome da empresa"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={budgetData.companyInfo.email}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, email: e.target.value }
                      }))}
                      placeholder="empresa@email.com"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={budgetData.companyInfo.phone}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, phone: e.target.value }
                      }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label>Endereço</Label>
                  <Textarea
                    value={budgetData.companyInfo.address}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, address: e.target.value }
                    }))}
                    placeholder="Endereço completo da empresa"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tema de Cores - RESTAURADO */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: currentTheme.primary }}>Escolha o Tema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setBudgetData(prev => ({ ...prev, colorTheme: key }));
                        setSelectedPremiumTemplate(null);
                        setAdvancedCustomization(null);
                      }}
                      className={`w-full h-10 sm:h-12 rounded-lg border-2 transition-all ${
                        budgetData.colorTheme === key && !selectedPremiumTemplate && !advancedCustomization ? 'border-gray-800 scale-105' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: theme.primary }}
                    />
                  ))}
                </div>
                {advancedCustomization && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-800 flex items-center gap-1">
                      <Palette className="w-4 h-4 text-indigo-500" />
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Cores Personalizadas Ativas
                    </p>
                  </div>
                )}
                {selectedPremiumTemplate && !advancedCustomization && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-yellow-800 flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Template Premium Ativo: {selectedPremiumTemplate.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ color: currentTheme.primary }}>
                  Dados do Cliente
                  <div className="flex gap-2">
                    <Button onClick={() => setShowClientModal(true)} size="sm" variant="outline">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Carregar
                    </Button>
                    <Button onClick={handleSaveClient} size="sm" variant="outline">
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Salvar
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome do Cliente</Label>
                  <Input
                    value={budgetData.clientInfo.name}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, name: e.target.value }
                    }))}
                    placeholder="Nome completo ou empresa"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={budgetData.clientInfo.email}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo, email: e.target.value }
                      }))}
                      placeholder="cliente@email.com"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={budgetData.clientInfo.phone}
                      onChange={(e) => setBudgetData(prev => ({
                        ...prev,
                        clientInfo: { ...prev.clientInfo, phone: e.target.value }
                      }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label>Endereço</Label>
                  <Textarea
                    value={budgetData.clientInfo.address}
                    onChange={(e) => setBudgetData(prev => ({
                      ...prev,
                      clientInfo: { ...prev.clientInfo, address: e.target.value }
                    }))}
                    placeholder="Endereço do cliente"
                    rows={2}
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
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ color: currentTheme.primary }}>
                  Itens do Orçamento
                  <Button onClick={addItem} size="sm" style={{ backgroundColor: currentTheme.primary }}>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetData.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label className="text-sm font-medium">Item {item.id}</Label>
                      {budgetData.items.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
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
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Qtd</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Preço Unit.</Label>
                        <PriceInput
                          value={item.unitPrice}
                          onChange={(value) => updateItem(item.id, 'unitPrice', value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input
                          value={`R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-bold">R$ {calculateSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm">Desconto (%):</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={budgetData.discount === 0 ? '' : budgetData.discount}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold" style={{ color: currentTheme.primary }}>
                    <span>Total Final:</span>
                    <span>R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: currentTheme.primary }}>Condições e Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Condições Especiais</Label>
                  <Textarea
                    value={budgetData.specialConditions}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, specialConditions: e.target.value }))}
                    rows={3}
                    placeholder="Condições de pagamento, prazo de entrega, etc."
                  />
                </div>

                <div>
                  <Label>Observações Adicionais</Label>
                  <Textarea
                    value={budgetData.observations}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, observations: e.target.value }))}
                    rows={3}
                    placeholder="Informações extras, garantias, etc."
                  />
                </div>

                <div>
                  <Label>Validade do Orçamento (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={budgetData.validityDays}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botão Gerar PDF */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <Button
                  onClick={handleGeneratePDF}
                  className="w-full h-12 text-base sm:text-lg font-semibold"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Gerar PDF do Orçamento
                  {(selectedPremiumTemplate) && (
                    <>
                      <Crown className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Clientes Salvos */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Clientes Salvos</h3>
              {savedClients.length === 0 ? (
                <p className="text-gray-500">Nenhum cliente salvo ainda.</p>
              ) : (
                <div className="space-y-3">
                  {savedClients.map((client, index) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={() => loadClient(client)} size="sm" className="flex-1 sm:flex-none">
                          Carregar
                        </Button>
                        <Button onClick={() => handleDeleteClient(client)} size="sm" variant="outline" className="text-red-500 flex-1 sm:flex-none">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowClientModal(false)} variant="outline">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetForm;
