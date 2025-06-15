
export interface CompanyInfo {
  name: string;
  logo?: File;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
}

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BudgetData {
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  items: ServiceItem[];
  specialConditions: string;
  observations: string;
  colorTheme: string;
  validityDays: number;
  discount: number;
  premiumTemplate?: any;
  exclusiveTemplate?: any;
  advancedCustomization?: any;
}

export interface SavedBudget {
  id: string;
  user_id: string;
  client_name: string;
  total_value: number;
  items: ServiceItem[];
  validity_days: number;
  discount: number;
  color_theme: string;
  special_conditions: string;
  observations: string;
  created_at: string;
  updated_at: string;
}

// Cores padrão restauradas
export const COLOR_THEMES = {
  blue: {
    primary: '#2980B9',
    secondary: '#1E40AF',
    accent: '#DBEAFE',
    text: '#000000',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    primary: '#16A085',
    secondary: '#059669',
    accent: '#D1FAE5',
    text: '#000000',
    gradient: 'from-green-500 to-green-600'
  },
  purple: {
    primary: '#8E44AD',
    secondary: '#7C3AED',
    accent: '#EDE9FE',
    text: '#000000',
    gradient: 'from-purple-500 to-purple-600'
  },
  red: {
    primary: '#E74C3C',
    secondary: '#DC2626',
    accent: '#FEE2E2',
    text: '#000000',
    gradient: 'from-red-500 to-red-600'
  },
  orange: {
    primary: '#E67E22',
    secondary: '#EA580C',
    accent: '#FED7AA',
    text: '#000000',
    gradient: 'from-orange-500 to-orange-600'
  }
};
