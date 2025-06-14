
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Palette, BarChart3, Archive, FileText } from 'lucide-react';
import { useLicenseValidation } from '@/hooks/useLicenseValidation';
import TemplateSelector, { PremiumTemplate } from './TemplateSelector';
import AdvancedCustomization, { AdvancedCustomizationOptions } from './AdvancedCustomization';
import AnalyticsDashboard from './AnalyticsDashboard';
import BudgetBackup from './BudgetBackup';
import { BudgetData } from '@/types/budget';

interface PremiumFeaturesProps {
  onTemplateSelect?: (template: PremiumTemplate) => void;
  onCustomizationChange?: (options: AdvancedCustomizationOptions) => void;
  onLoadBudget?: (budgetData: BudgetData) => void;
}

const PremiumFeatures = ({ onTemplateSelect, onCustomizationChange, onLoadBudget }: PremiumFeaturesProps) => {
  const { license } = useLicenseValidation();
  const [activeFeature, setActiveFeature] = useState<'templates' | 'customization' | 'analytics' | 'backup' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customizationOptions, setCustomizationOptions] = useState<AdvancedCustomizationOptions>({
    customColors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#DBEAFE',
      text: '#1F2937'
    },
    typography: {
      headerFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: 14
    },
    layout: {
      margins: 20,
      spacing: 20,
      headerHeight: 100
    },
    watermark: {
      enabled: false,
      text: '',
      opacity: 30,
      position: 'bottom-right'
    },
    customCSS: ''
  });

  // Verificar se o usuário tem licença enterprise
  if (!license || license.plan !== 'enterprise') {
    return (
      <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50">
        <CardContent className="p-8 text-center">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Funcionalidades Premium</h3>
          <p className="text-gray-600 mb-4">
            Estas funcionalidades estão disponíveis apenas para usuários do plano Enterprise.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-600" />
              <span>Templates Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-yellow-600" />
              <span>Personalização Avançada</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-yellow-600" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-yellow-600" />
              <span>Backup de Orçamentos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const features = [
    {
      id: 'templates' as const,
      title: 'Templates Premium',
      description: 'Designs profissionais e exclusivos',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      id: 'customization' as const,
      title: 'Personalização Avançada',
      description: 'Customize cores, fontes e layout',
      icon: Palette,
      color: 'bg-purple-500'
    },
    {
      id: 'analytics' as const,
      title: 'Analytics',
      description: 'Relatórios e estatísticas detalhadas',
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      id: 'backup' as const,
      title: 'Backup de Orçamentos',
      description: 'Salve e gerencie seus orçamentos',
      icon: Archive,
      color: 'bg-orange-500'
    }
  ];

  const handleTemplateSelect = (template: PremiumTemplate) => {
    setSelectedTemplate(template.id);
    onTemplateSelect?.(template);
  };

  const handleCustomizationChange = (options: AdvancedCustomizationOptions) => {
    setCustomizationOptions(options);
    onCustomizationChange?.(options);
  };

  return (
    <div className="space-y-6">
      {!activeFeature && (
        <>
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Funcionalidades Premium</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={() => setActiveFeature(feature.id)}
                    >
                      Acessar {feature.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {activeFeature && (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveFeature(null)}
            className="mb-4"
          >
            ← Voltar para Funcionalidades Premium
          </Button>

          {activeFeature === 'templates' && (
            <TemplateSelector 
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
            />
          )}

          {activeFeature === 'customization' && (
            <AdvancedCustomization
              options={customizationOptions}
              onOptionsChange={handleCustomizationChange}
            />
          )}

          {activeFeature === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeFeature === 'backup' && onLoadBudget && (
            <BudgetBackup onLoadBudget={onLoadBudget} />
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumFeatures;
