
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Crown, Upload, Palette, Type, Layout } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export interface AdvancedCustomizationOptions {
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  typography: {
    headerFont: string;
    bodyFont: string;
    fontSize: number;
  };
  layout: {
    margins: number;
    spacing: number;
    headerHeight: number;
  };
  watermark: {
    enabled: boolean;
    text: string;
    opacity: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
  customCSS: string;
}

interface AdvancedCustomizationProps {
  options: AdvancedCustomizationOptions;
  onOptionsChange: (options: AdvancedCustomizationOptions) => void;
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Lato',
  'Source Sans Pro',
  'Nunito'
];

const AdvancedCustomization = ({ options, onOptionsChange }: AdvancedCustomizationProps) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'watermark' | 'css'>('colors');

  const updateOptions = (section: keyof AdvancedCustomizationOptions, updates: any) => {
    onOptionsChange({
      ...options,
      [section]: { ...options[section], ...updates }
    });
  };

  const tabs = [
    { id: 'colors' as const, label: 'Cores', icon: Palette },
    { id: 'typography' as const, label: 'Tipografia', icon: Type },
    { id: 'layout' as const, label: 'Layout', icon: Layout },
    { id: 'watermark' as const, label: 'Marca D\'água', icon: Upload },
    { id: 'css' as const, label: 'CSS Customizado', icon: Type }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Personalização Avançada
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Enterprise
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <h4 className="font-medium">Cores Personalizadas</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={options.customColors.primary}
                    onChange={(e) => updateOptions('customColors', { primary: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={options.customColors.primary}
                    onChange={(e) => updateOptions('customColors', { primary: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={options.customColors.secondary}
                    onChange={(e) => updateOptions('customColors', { secondary: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={options.customColors.secondary}
                    onChange={(e) => updateOptions('customColors', { secondary: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label>Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={options.customColors.accent}
                    onChange={(e) => updateOptions('customColors', { accent: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={options.customColors.accent}
                    onChange={(e) => updateOptions('customColors', { accent: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label>Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={options.customColors.text}
                    onChange={(e) => updateOptions('customColors', { text: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={options.customColors.text}
                    onChange={(e) => updateOptions('customColors', { text: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <h4 className="font-medium">Tipografia</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fonte dos Títulos</Label>
                <select
                  value={options.typography.headerFont}
                  onChange={(e) => updateOptions('typography', { headerFont: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Fonte do Corpo</Label>
                <select
                  value={options.typography.bodyFont}
                  onChange={(e) => updateOptions('typography', { bodyFont: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Tamanho da Fonte Base: {options.typography.fontSize}px</Label>
              <Slider
                value={[options.typography.fontSize]}
                onValueChange={([value]) => updateOptions('typography', { fontSize: value })}
                min={10}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <h4 className="font-medium">Layout e Espaçamento</h4>
            <div>
              <Label>Margens: {options.layout.margins}mm</Label>
              <Slider
                value={[options.layout.margins]}
                onValueChange={([value]) => updateOptions('layout', { margins: value })}
                min={10}
                max={50}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Espaçamento entre Seções: {options.layout.spacing}px</Label>
              <Slider
                value={[options.layout.spacing]}
                onValueChange={([value]) => updateOptions('layout', { spacing: value })}
                min={10}
                max={50}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Altura do Cabeçalho: {options.layout.headerHeight}px</Label>
              <Slider
                value={[options.layout.headerHeight]}
                onValueChange={([value]) => updateOptions('layout', { headerHeight: value })}
                min={50}
                max={200}
                step={10}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Watermark Tab */}
        {activeTab === 'watermark' && (
          <div className="space-y-4">
            <h4 className="font-medium">Marca D'água</h4>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.watermark.enabled}
                onChange={(e) => updateOptions('watermark', { enabled: e.target.checked })}
                id="watermark-enabled"
              />
              <Label htmlFor="watermark-enabled">Habilitar marca d'água</Label>
            </div>
            
            {options.watermark.enabled && (
              <>
                <div>
                  <Label>Texto da Marca D'água</Label>
                  <Input
                    value={options.watermark.text}
                    onChange={(e) => updateOptions('watermark', { text: e.target.value })}
                    placeholder="Texto da marca d'água"
                  />
                </div>
                <div>
                  <Label>Opacidade: {options.watermark.opacity}%</Label>
                  <Slider
                    value={[options.watermark.opacity]}
                    onValueChange={([value]) => updateOptions('watermark', { opacity: value })}
                    min={10}
                    max={100}
                    step={10}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Posição</Label>
                  <select
                    value={options.watermark.position}
                    onChange={(e) => updateOptions('watermark', { position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="top-left">Superior Esquerda</option>
                    <option value="top-right">Superior Direita</option>
                    <option value="bottom-left">Inferior Esquerda</option>
                    <option value="bottom-right">Inferior Direita</option>
                    <option value="center">Centro</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        {/* CSS Tab */}
        {activeTab === 'css' && (
          <div className="space-y-4">
            <h4 className="font-medium">CSS Personalizado</h4>
            <p className="text-sm text-gray-600">
              Adicione CSS customizado para personalizar ainda mais o design do PDF.
            </p>
            <Textarea
              value={options.customCSS}
              onChange={(e) => updateOptions('customCSS', e.target.value)}
              placeholder="/* Adicione seu CSS aqui */
.header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.total-section {
  border: 2px solid #667eea;
  border-radius: 8px;
}"
              rows={10}
              className="font-mono text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedCustomization;
