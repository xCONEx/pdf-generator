
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Eye, Download, Sparkles, Star } from 'lucide-react';

export interface ExclusiveTemplate {
  id: string;
  name: string;
  description: string;
  category: 'luxury' | 'tech' | 'creative' | 'executive';
  preview: string;
  features: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  isNew?: boolean;
  isPremium?: boolean;
}

const EXCLUSIVE_TEMPLATES: ExclusiveTemplate[] = [
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Template exclusivo com acabamento dourado para clientes VIP',
    category: 'luxury',
    preview: '/templates/luxury-gold-preview.jpg',
    features: ['Acabamento Dourado', 'Tipografia Exclusiva', 'Marca D\'água Premium', 'Assinatura Digital'],
    colorScheme: {
      primary: '#D4AF37',
      secondary: '#B8860B',
      accent: '#FFD700',
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600'
    },
    isNew: true,
    isPremium: true
  },
  {
    id: 'tech-neon',
    name: 'Tech Neon',
    description: 'Design futurista com elementos neon para empresas de tecnologia',
    category: 'tech',
    preview: '/templates/tech-neon-preview.jpg',
    features: ['Efeitos Neon', 'Gradientes Animados', 'QR Code Integrado', 'Layout Responsivo'],
    colorScheme: {
      primary: '#00FFFF',
      secondary: '#FF00FF',
      accent: '#00FF00',
      gradient: 'from-cyan-400 via-purple-500 to-green-400'
    },
    isNew: true,
    isPremium: true
  },
  {
    id: 'creative-artistic',
    name: 'Creative Artistic',
    description: 'Template artístico com elementos criativos únicos',
    category: 'creative',
    preview: '/templates/creative-artistic-preview.jpg',
    features: ['Elementos Artísticos', 'Cores Vibrantes', 'Layout Criativo', 'Fontes Customizadas'],
    colorScheme: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      gradient: 'from-red-400 via-pink-500 to-blue-500'
    },
    isPremium: true
  },
  {
    id: 'executive-platinum',
    name: 'Executive Platinum',
    description: 'Template executivo com acabamento platinum para grandes corporações',
    category: 'executive',
    preview: '/templates/executive-platinum-preview.jpg',
    features: ['Design Corporativo', 'Selo de Qualidade', 'Certificado Digital', 'Layout Profissional'],
    colorScheme: {
      primary: '#E5E5E5',
      secondary: '#C0C0C0',
      accent: '#F5F5F5',
      gradient: 'from-gray-300 via-gray-400 to-gray-500'
    },
    isPremium: true
  },
  {
    id: 'luxury-diamond',
    name: 'Luxury Diamond',
    description: 'O mais exclusivo - Template com elementos de diamante',
    category: 'luxury',
    preview: '/templates/luxury-diamond-preview.jpg',
    features: ['Efeito Diamante', 'Holografia', 'Certificado de Autenticidade', 'Marca D\'água 3D'],
    colorScheme: {
      primary: '#B9F2FF',
      secondary: '#87CEEB',
      accent: '#E0FFFF',
      gradient: 'from-blue-200 via-blue-300 to-blue-400'
    },
    isNew: true,
    isPremium: true
  },
  {
    id: 'tech-matrix',
    name: 'Tech Matrix',
    description: 'Inspirado no Matrix - Para desenvolvedores e empresas tech',
    category: 'tech',
    preview: '/templates/tech-matrix-preview.jpg',
    features: ['Código Matrix', 'Efeitos Digitais', 'Criptografia Visual', 'Terminal Integrado'],
    colorScheme: {
      primary: '#00FF41',
      secondary: '#008F11',
      accent: '#00FF00',
      gradient: 'from-green-400 via-green-500 to-green-600'
    },
    isNew: true,
    isPremium: true
  }
];

interface ExclusiveTemplatesProps {
  selectedTemplate: string;
  onTemplateSelect: (template: ExclusiveTemplate) => void;
}

const ExclusiveTemplates = ({ selectedTemplate, onTemplateSelect }: ExclusiveTemplatesProps) => {
  const [previewTemplate, setPreviewTemplate] = useState<ExclusiveTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const getCategoryLabel = (category: string) => {
    const labels = {
      luxury: 'Luxo',
      tech: 'Tecnologia',
      creative: 'Criativo',
      executive: 'Executivo'
    };
    return labels[category as keyof typeof labels];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'luxury': return '💎';
      case 'tech': return '🚀';
      case 'creative': return '🎨';
      case 'executive': return '👔';
      default: return '✨';
    }
  };

  const filteredTemplates = filterCategory === 'all' 
    ? EXCLUSIVE_TEMPLATES 
    : EXCLUSIVE_TEMPLATES.filter(t => t.category === filterCategory);

  const categories = ['all', 'luxury', 'tech', 'creative', 'executive'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-500" />
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Templates Exclusivos Enterprise</h3>
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-purple-500 text-white">
          🏆 Exclusivo
        </Badge>
      </div>

      {/* Filtros de Categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={filterCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(category)}
            className="flex items-center gap-1"
          >
            {category !== 'all' && getCategoryIcon(category)}
            {category === 'all' ? 'Todos' : getCategoryLabel(category)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-yellow-500 border-yellow-500' 
                : 'border-gray-200 hover:border-yellow-300'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    {template.isNew && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Novo
                      </Badge>
                    )}
                    {template.isPremium && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs">{getCategoryIcon(template.category)}</span>
                    <span className="text-xs text-gray-600">{getCategoryLabel(template.category)}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Preview da paleta de cores com gradiente */}
              <div 
                className="w-full h-8 rounded-lg mb-3"
                style={{ 
                  background: `linear-gradient(135deg, ${template.colorScheme.primary}, ${template.colorScheme.secondary}, ${template.colorScheme.accent})` 
                }}
              />
              
              {/* Features */}
              <div className="space-y-1 mb-3">
                {template.features.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{feature}</span>
                  </div>
                ))}
                {template.features.length > 2 && (
                  <p className="text-xs text-gray-500">+{template.features.length - 2} recursos...</p>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => onTemplateSelect(template)}
                className={`w-full ${
                  selectedTemplate === template.id 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                }`}
              >
                {selectedTemplate === template.id ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Selecionado
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-1" />
                    Selecionar Template
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{previewTemplate.name}</h3>
                  {previewTemplate.isNew && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Novo
                    </Badge>
                  )}
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-3">{previewTemplate.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span>{getCategoryIcon(previewTemplate.category)}</span>
                  <span className="text-sm font-medium">{getCategoryLabel(previewTemplate.category)}</span>
                </div>
              </div>

              {/* Features completas */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Recursos Exclusivos:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {previewTemplate.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview do template */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">Preview do Template Exclusivo</p>
                <div 
                  className={`w-full h-96 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${previewTemplate.colorScheme.gradient}`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Crown className="w-8 h-8" />
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-3xl font-bold mb-2">{previewTemplate.name}</h4>
                    <p className="opacity-90 mb-4">{previewTemplate.description}</p>
                    <div className="text-sm opacity-75">
                      {getCategoryIcon(previewTemplate.category)} {getCategoryLabel(previewTemplate.category)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    onTemplateSelect(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Usar Este Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusiveTemplates;
