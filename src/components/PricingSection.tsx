
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Básico',
      price: 'R$ 29',
      period: '/mês',
      description: 'Ideal para freelancers e pequenos negócios',
      features: [
        '10 PDFs por mês',
        'Templates básicos',
        'Suporte por email',
        'Personalização limitada'
      ],
      link: 'https://pay.cakto.com.br/33chw64',
      popular: false
    },
    {
      name: 'Profissional',
      price: 'R$ 59',
      period: '/mês',
      description: 'Perfeito para empresas em crescimento',
      features: [
        '50 PDFs por mês',
        'Todos os templates',
        'Suporte prioritário',
        'Personalização completa',
        'Logo da empresa',
        'Múltiplos temas'
      ],
      link: 'https://pay.cakto.com.br/hkf8kro',
      popular: true
    },
    {
      name: 'Empresarial',
      price: 'R$ 99',
      period: '/mês',
      description: 'Para grandes empresas e equipes',
      features: [
        'PDFs ilimitados',
        'Templates premium',
        'Suporte 24/7',
        'Personalização avançada',
        'API de integração',
        'Relatórios analytics',
        'Equipe ilimitada'
      ],
      link: 'https://pay.cakto.com.br/3b6s5eo',
      popular: false
    }
  ];

  return (
    <section id="planos" className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-xl text-gray-600">
            Preços transparentes sem surpresas. Cancele quando quiser.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 shadow-lg hover:shadow-xl transition-shadow ${
                plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => window.open(plan.link, '_blank')}
                >
                  Escolher {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Precisa de um plano personalizado? 
          </p>
          <Button variant="outline" size="lg">
            Falar com Vendas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
