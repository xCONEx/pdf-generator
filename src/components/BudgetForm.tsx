import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, Download } from 'lucide-react';
import { BudgetData, ServiceItem, COLOR_THEMES } from '@/types/budget';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

const BudgetForm = () => {
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
    try {
      await generatePDF(budgetData);
      toast({
        title: "PDF Gerado com Sucesso!",
        description: "Seu orçamento foi gerado e está sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const currentTheme = COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent mb-2`}>
            Gerador de Orçamentos
          </h1>
          <p className="text-gray-600">Crie orçamentos profissionais e personalizados em PDF</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-6">
            {/* Informações da Empresa */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: currentTheme.primary }}>
                  <Upload className="w-5 h-5" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="max-h-28 max-w-full object-contain" />
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Clique para fazer upload do logo</p>
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

                <div className="grid grid-cols-2 gap-4">
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

            {/* Tema de Cores */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: currentTheme.primary }}>Escolha o Tema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => setBudgetData(prev => ({ ...prev, colorTheme: key }))}
                      className={`w-full h-12 rounded-lg border-2 transition-all ${
                        budgetData.colorTheme === key ? 'border-gray-800 scale-105' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: theme.primary }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle style={{ color: currentTheme.primary }}>Dados do Cliente</CardTitle>
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

                <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-6">
            {/* Itens do Orçamento */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between" style={{ color: currentTheme.primary }}>
                  Itens do Orçamento
                  <Button onClick={addItem} size="sm" style={{ backgroundColor: currentTheme.primary }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetData.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label className="text-sm font-medium">Item {item.id}</Label>
                      {budgetData.items.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
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
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input
                          value={`R$ ${item.total.toFixed(2)}`}
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
                    <span className="font-bold">R$ {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm">Desconto (%):</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={budgetData.discount}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  </div>

                  <div className="flex justify-between items-center text-lg font-bold" style={{ color: currentTheme.primary }}>
                    <span>Total Final:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
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
                  className="w-full h-12 text-lg font-semibold"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Gerar PDF do Orçamento
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;
