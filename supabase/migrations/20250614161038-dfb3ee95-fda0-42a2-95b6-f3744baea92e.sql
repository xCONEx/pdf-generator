
-- Criar tabela para salvar dados da empresa
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para salvar dados dos clientes
CREATE TABLE public.saved_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para salvar orçamentos
CREATE TABLE public.saved_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_name TEXT NOT NULL,
  items JSONB NOT NULL,
  special_conditions TEXT,
  observations TEXT,
  color_theme TEXT DEFAULT 'blue',
  validity_days INTEGER DEFAULT 30,
  discount NUMERIC DEFAULT 0,
  total_value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_budgets ENABLE ROW LEVEL SECURITY;

-- Políticas para company_profiles
CREATE POLICY "Users can view their own company profiles" 
  ON public.company_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company profiles" 
  ON public.company_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profiles" 
  ON public.company_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company profiles" 
  ON public.company_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para saved_clients
CREATE POLICY "Users can view their own saved clients" 
  ON public.saved_clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved clients" 
  ON public.saved_clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved clients" 
  ON public.saved_clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved clients" 
  ON public.saved_clients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para saved_budgets
CREATE POLICY "Users can view their own saved budgets" 
  ON public.saved_budgets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved budgets" 
  ON public.saved_budgets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved budgets" 
  ON public.saved_budgets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved budgets" 
  ON public.saved_budgets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX idx_company_profiles_user_id ON public.company_profiles(user_id);
CREATE INDEX idx_saved_clients_user_id ON public.saved_clients(user_id);
CREATE INDEX idx_saved_budgets_user_id ON public.saved_budgets(user_id);
CREATE INDEX idx_saved_budgets_created_at ON public.saved_budgets(created_at DESC);
