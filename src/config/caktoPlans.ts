// Configuração dos Planos da Cakto
export interface CaktoPlan {
  id: string;
  name: string;
  internalPlan: 'basic' | 'premium' | 'enterprise';
  pdfLimit: number;
  price: number;
  description: string;
  caktoUrl: string;
}

export const CAKTO_PLANS: CaktoPlan[] = [
  {
    id: '33chw64',
    name: 'Plano Básico - OrçaFácilPDF',
    internalPlan: 'basic',
    pdfLimit: 100,
    price: 19.90,
    description: '100 PDFs por mês - Ideal para iniciantes',
    caktoUrl: 'https://pay.cakto.com.br/33chw64'
  },
  {
    id: 'c4jwped',
    name: 'Plano Profissional - OrçaFácilPDF',
    internalPlan: 'premium',
    pdfLimit: 1000,
    price: 39.90,
    description: '1.000 PDFs por mês - Para profissionais',
    caktoUrl: 'https://pay.cakto.com.br/c4jwped'
  },
  {
    id: '3b6s5eo',
    name: 'Plano Empresarial - OrçaFácilPDF',
    internalPlan: 'enterprise',
    pdfLimit: 999999,
    price: 59.90,
    description: 'PDFs ilimitados - Para empresas',
    caktoUrl: 'https://pay.cakto.com.br/3b6s5eo'
  }
];

// Mapeamento de palavras-chave para identificar planos
export const PLAN_KEYWORDS = {
  basic: ['basic', 'básico', 'iniciante', 'starter', 'simples'],
  premium: ['premium', 'pro', 'avançado', 'profissional'],
  enterprise: ['enterprise', 'ilimitado', 'empresarial', 'business']
};

// Função para mapear produto da Cakto para plano interno
export function mapCaktoProductToPlan(productName: string, productId: string): 'basic' | 'premium' | 'enterprise' {
  const name = (productName || '').toLowerCase();
  const id = (productId || '').toLowerCase();

  // Verificar Enterprise primeiro (mais específico)
  if (PLAN_KEYWORDS.enterprise.some(keyword => name.includes(keyword) || id.includes(keyword))) {
    return 'enterprise';
  }

  // Verificar Premium
  if (PLAN_KEYWORDS.premium.some(keyword => name.includes(keyword) || id.includes(keyword))) {
    return 'premium';
  }

  // Verificar Basic
  if (PLAN_KEYWORDS.basic.some(keyword => name.includes(keyword) || id.includes(keyword))) {
    return 'basic';
  }

  // Fallback: tentar identificar por ID específico
  if (id.includes('premium') || id.includes('pro')) return 'premium';
  if (id.includes('enterprise') || id.includes('business')) return 'enterprise';
  if (id.includes('basic') || id.includes('starter')) return 'basic';

  // Fallback: tentar identificar por nome específico
  if (name.includes('premium') || name.includes('pro')) return 'premium';
  if (name.includes('enterprise') || name.includes('ilimitado')) return 'enterprise';
  if (name.includes('basic') || name.includes('básico')) return 'basic';

  // Default para basic se não conseguir identificar
  console.warn(`Não foi possível identificar o plano para: "${productName}" (${productId}). Usando basic como padrão.`);
  return 'basic';
}

// Função para obter configuração do plano
export function getPlanConfig(plan: 'basic' | 'premium' | 'enterprise'): CaktoPlan {
  const planConfig = CAKTO_PLANS.find(p => p.internalPlan === plan);
  if (!planConfig) {
    throw new Error(`Plano não encontrado: ${plan}`);
  }
  return planConfig;
}

// Função para validar se um plano é válido
export function isValidPlan(plan: string): plan is 'basic' | 'premium' | 'enterprise' {
  return ['basic', 'premium', 'enterprise'].includes(plan);
} 
