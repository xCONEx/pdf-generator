
-- Tabela de licenças de usuários
CREATE TABLE user_licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'suspended')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  pdfs_generated INTEGER DEFAULT 0,
  pdf_limit INTEGER NOT NULL,
  purchase_reference TEXT, -- Referência da compra (Cakto, Stripe, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de gerações de PDF (log de auditoria)
CREATE TABLE pdf_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  total_value DECIMAL(10,2),
  fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras (webhook da Cakto/outros)
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  product_name TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount DECIMAL(10,2),
  payment_status TEXT,
  external_id TEXT UNIQUE, -- ID da transação externa
  webhook_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_user_licenses_user_id ON user_licenses(user_id);
CREATE INDEX idx_user_licenses_status ON user_licenses(status);
CREATE INDEX idx_pdf_generations_user_id ON pdf_generations(user_id);
CREATE INDEX idx_pdf_generations_created_at ON pdf_generations(created_at);
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_external_id ON purchases(external_id);

-- RLS (Row Level Security)
ALTER TABLE user_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own license" ON user_licenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own PDF generations" ON pdf_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Função para incrementar contador de PDFs
CREATE OR REPLACE FUNCTION increment_pdf_count(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_licenses 
  SET pdfs_generated = pdfs_generated + 1,
      updated_at = NOW()
  WHERE user_licenses.user_id = increment_pdf_count.user_id
    AND status = 'active';
END;
$$;

-- Função para processar compras (triggered by webhook)
CREATE OR REPLACE FUNCTION process_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  license_duration INTERVAL;
  pdf_limit_value INTEGER;
BEGIN
  -- Só processar se ainda não foi processado
  IF NEW.processed = TRUE THEN
    RETURN NEW;
  END IF;

  -- Definir duração e limites baseado no plano
  CASE NEW.plan
    WHEN 'basic' THEN
      license_duration := INTERVAL '30 days';
      pdf_limit_value := 50;
    WHEN 'premium' THEN
      license_duration := INTERVAL '30 days';
      pdf_limit_value := 500;
    ELSE
      license_duration := INTERVAL '30 days';
      pdf_limit_value := 50;
  END CASE;

  -- Buscar ou criar usuário
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = NEW.email;

  -- Se usuário não existe, criar entrada temporária
  IF target_user_id IS NULL THEN
    -- Aguardar criação manual da conta
    RETURN NEW;
  END IF;

  -- Inserir ou atualizar licença
  INSERT INTO user_licenses (
    user_id, 
    plan, 
    status, 
    expires_at, 
    pdf_limit,
    purchase_reference
  ) VALUES (
    target_user_id,
    NEW.plan,
    'active',
    NOW() + license_duration,
    pdf_limit_value,
    NEW.external_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = NEW.plan,
    status = 'active',
    expires_at = NOW() + license_duration,
    pdf_limit = pdf_limit_value,
    purchase_reference = NEW.external_id,
    updated_at = NOW();

  -- Marcar como processado
  NEW.processed := TRUE;
  
  RETURN NEW;
END;
$$;

-- Trigger para processar compras automaticamente
CREATE TRIGGER process_purchase_trigger
  BEFORE UPDATE ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION process_purchase();
