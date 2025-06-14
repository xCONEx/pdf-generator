
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SalesHeader = () => {
  const navigate = useNavigate();

  return (
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
            <a href="#contato" className="text-gray-600 hover:text-gray-900">Contato</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
            >
              Entrar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/')}
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SalesHeader;
