
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
}

export const COLOR_THEMES = {
  blue: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#DBEAFE',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    primary: '#10B981',
    secondary: '#047857',
    accent: '#D1FAE5',
    gradient: 'from-green-500 to-green-600'
  },
  orange: {
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FEF3C7',
    gradient: 'from-orange-500 to-orange-600'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#EDE9FE',
    gradient: 'from-purple-500 to-purple-600'
  },
  red: {
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#FEE2E2',
    gradient: 'from-red-500 to-red-600'
  },
  black: {
    primary: '#1F2937',
    secondary: '#111827',
    accent: '#F3F4F6',
    gradient: 'from-gray-800 to-gray-900'
  }
};
