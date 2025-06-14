
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Eye } from 'lucide-react';

export interface PremiumTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'modern' | 'classic' | 'minimalist' | 'corporate';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: 'modern-gradient',
    name: 'Gradiente Moderno',
    description: 'Design contemporâneo com gradientes suaves',
    preview: '/templates/modern-gradient-preview.jpg',
    category: 'modern',
    colorScheme: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb'
    }
  },
  {
    id: 'corporate-elite',
    name: 'Corporativo Elite',
    description: 'Layout profissional para grandes empresas',
    preview: '/templates/corporate-elite-preview.jpg',
    category: 'corporate',
    colorScheme: {
      primary: '#1a365d',
      secondary: '#2c5282',
      accent: '#4299e1'
    }
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalista Clean',
    description: 'Design limpo e elegante',
    preview: '/templates/minimalist-clean-preview.jpg',
    category: 'minimalist',
    colorScheme: {
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#e2e8f0'
    }
  },
  {
    id: 'classic-elegant',
    name: 'Clássico Elegante',
    description: 'Estilo tradicional com toques elegantes',
    preview: '/templates/classic-elegant-preview.jpg',
    category: 'classic',
    colorScheme: {
      primary: '#744210',
      secondary: '#975a16',
      accent: '#d69e2e'
    }
  }
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (template: PremiumTemplate) => void;
}

const TemplateSelector = ({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) => {
  const [previewTemplate, setPreviewTemplate] = useState<PremiumTemplate | null>(null);

  const getCategoryLabel = (category: string) => {
    const labels = {
      modern: 'Moderno',
      classic: 'Clássico',
      minimalist: 'Minimalista',
      corporate: 'Corporativo'
    };
    return labels[category as keyof typeof labels];
  };

  const categories = ['modern', 'classic', 'minimalist', 'corporate'] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Templates Premium</h3>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Enterprise
        </Badge>
      </div>

      {categories.map(category => {
        const categoryTemplates = PREMIUM_TEMPLATES.filter(t => t.category === category);
        
        return (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-gray-700">{getCategoryLabel(category)}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryTemplates.map(template => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: template.colorScheme.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: template.colorScheme.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: template.colorScheme.accent }}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onTemplateSelect(template)}
                      className="w-full"
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                    >
                      {selectedTemplate === template.id ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{previewTemplate.name}</h3>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Fechar
                </Button>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">Preview do template</p>
                <div 
                  className="w-full h-96 rounded-lg flex items-center justify-center text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${previewTemplate.colorScheme.primary}, ${previewTemplate.colorScheme.secondary})` 
                  }}
                >
                  <div className="text-center">
                    <h4 className="text-2xl font-bold mb-2">{previewTemplate.name}</h4>
                    <p className="opacity-90">{previewTemplate.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
