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

// Removendo cores personalizadas temporariamente, mantendo apenas azul padrão
export const COLOR_THEMES = {
  blue: {
    primary: '#2980B9',
    secondary: '#1E40AF',
    accent: '#DBEAFE',
    text: '#000000',
    gradient: 'from-blue-500 to-blue-600'
  }
};
