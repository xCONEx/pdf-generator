
import SalesHeader from '@/components/SalesHeader';
import SalesFooter from '@/components/SalesFooter';
import PricingSection from '@/components/PricingSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Star, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

const SalesPage = () => {
  useEffect(() => {
    console.log('SalesPage component mounted');
  }, []);

  const features = [
    'Geração de PDFs profissionais e personalizados',
    'Templates com diferentes temas de cores',
    'Informações da empresa e cliente organizadas',
    'Cálculos automáticos com desconto',
    'Condições especiais e observações',
    'Validade configurável do orçamento',
    'Interface intuitiva e fácil de usar',
    'Suporte completo por email'
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      company: 'Consultoria MS',
      text: 'O gerador de orçamentos revolucionou meu negócio. Agora consigo criar propostas profissionais em minutos!'
    },
    {
      name: 'João Santos',
      company: 'Tech Solutions',
      text: 'Ferramenta indispensável para qualquer empresa. A personalização e facilidade de uso são excepcionais.'
    },
    {
      name: 'Ana Costa',
      company: 'Design Studio',
      text: 'Desde que começei a usar, minha taxa de conversão de orçamentos aumentou significativamente.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SalesHeader />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Crie Orçamentos
            <span className="text-blue-600 block">Profissionais em Minutos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforme sua forma de trabalhar com nossa ferramenta completa para geração de orçamentos. 
            Personalize, organize e impressione seus clientes com propostas profissionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              Começar Agora
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Por que escolher nosso Gerador de Orçamentos?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Check className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <p className="text-gray-700">{feature}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            O que nossos clientes dizem
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={16} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já transformaram seus orçamentos
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
            Escolher Plano
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>

      <SalesFooter />
    </div>
  );
};

export default SalesPage;
