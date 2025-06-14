
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, ArrowRight, FileText, Palette, Calculator, Download, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalesPage = () => {
  const navigate = useNavigate();

  const goToApp = () => {
    navigate('/');
  };

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: 'PDFs Profissionais',
      description: 'Geração de orçamentos em PDF com design moderno e profissional'
    },
    {
      icon: <Palette className="w-8 h-8 text-green-600" />,
      title: 'Múltiplos Temas',
      description: 'Escolha entre diferentes temas de cores para personalizar seus orçamentos'
    },
    {
      icon: <Calculator className="w-8 h-8 text-orange-600" />,
      title: 'Cálculos Automáticos',
      description: 'Sistema inteligente de cálculos com descontos e totalizações automáticas'
    },
    {
      icon: <Download className="w-8 h-8 text-purple-600" />,
      title: 'Download Instantâneo',
      description: 'Baixe seus orçamentos imediatamente após a criação'
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: 'Gestão de Clientes',
      description: 'Salve e gerencie informações de clientes para reutilização'
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: 'Dados Seguros',
      description: 'Suas informações são protegidas com criptografia de ponta'
    }
  ];

  const plans = [
    {
      name: 'Básico',
      price: 'R$ 19,90',
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
      price: 'R$ 39,90',
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
      link: 'https://pay.cakto.com.br/c4jwped',
      popular: true
    },
    {
      name: 'Empresarial',
      price: 'R$ 59,90',
      period: '/mês',
      description: 'Para grandes empresas e equipes',
      features: [
        'PDFs ilimitados',
        'Templates premium',
        'Suporte 24/7',
        'Personalização avançada',
        'Relatórios analytics',
        'Backup de orçamentos para buscar',
        'Dados salvos automaticamente'
      ],
      link: 'https://pay.cakto.com.br/3b6s5eo',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      company: 'Consultoria MS',
      text: 'O gerador de orçamentos revolucionou meu negócio. Agora consigo criar propostas profissionais em minutos!',
      rating: 5
    },
    {
      name: 'João Santos',
      company: 'Tech Solutions',
      text: 'Ferramenta indispensável para qualquer empresa. A personalização e facilidade de uso são excepcionais.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      company: 'Design Studio',
      text: 'Desde que começei a usar, minha taxa de conversão de orçamentos aumentou significativamente.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Gerador de Orçamentos</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-gray-900">Recursos</a>
              <a href="#planos" className="text-gray-600 hover:text-gray-900">Planos</a>
              <a href="#depoimentos" className="text-gray-600 hover:text-gray-900">Depoimentos</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={goToApp}
              >
                Entrar
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={goToApp}
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>
      
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
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              onClick={goToApp}
            >
              Começar Agora
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4"
              onClick={goToApp}
            >
              Acessar Sistema
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Recursos Poderosos para Seu Negócio
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Simplifique sua rotina de orçamentos
              </h2>
              <div className="space-y-4">
                {[
                  'Reduza o tempo de criação de orçamentos em 80%',
                  'Impressione clientes com design profissional',
                  'Organize informações de forma clara e objetiva',
                  'Tenha controle total sobre preços e descontos',
                  'Salve dados para reutilização futura'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="text-green-500 flex-shrink-0" size={20} />
                    <p className="text-gray-700 text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                className="mt-8 bg-blue-600 hover:bg-blue-700"
                onClick={goToApp}
              >
                Experimente Gratuitamente
              </Button>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Teste sem compromisso
              </h3>
              <p className="text-gray-600 mb-6">
                Experimente todas as funcionalidades do sistema por 7 dias gratuitamente.
                Sem cartão de crédito necessário.
              </p>
              <ul className="space-y-3">
                {[
                  'Acesso completo por 7 dias',
                  'Suporte dedicado',
                  'Todos os templates inclusos',
                  'Sem taxas ocultas'
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="text-green-500" size={16} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            O que nossos clientes dizem
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
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

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          <div className="grid gap-6">
            {[
              {
                question: 'Como funciona o período de teste?',
                answer: 'Você tem acesso completo por 7 dias gratuitamente. Não é necessário cartão de crédito para começar.'
              },
              {
                question: 'Posso cancelar a qualquer momento?',
                answer: 'Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.'
              },
              {
                question: 'Os dados ficam salvos na nuvem?',
                answer: 'Sim, todas as informações ficam seguras em nossos servidores com backup automático.'
              },
              {
                question: 'Posso usar em múltiplos dispositivos?',
                answer: 'Sim, você pode acessar o sistema de qualquer dispositivo com internet.'
              }
            ].map((faq, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já transformaram seus orçamentos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-4"
              onClick={goToApp}
            >
              Começar Teste Grátis
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              onClick={goToApp}
            >
              Acessar Sistema
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GF</span>
                </div>
                <span className="text-xl font-bold">Gerador de Orçamentos</span>
              </div>
              <p className="text-gray-400">
                A solução completa para criação de orçamentos profissionais.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
                <li><a href="#planos" className="hover:text-white">Planos</a></li>
                <li><a href="#" className="hover:text-white">Demonstração</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Gerador de Orçamentos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SalesPage;
