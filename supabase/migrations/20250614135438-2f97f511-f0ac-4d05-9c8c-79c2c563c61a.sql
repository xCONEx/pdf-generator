
-- Tabela de licenças de usuários
CREATE TABLE user_licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'suspended')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  pdfs_generated INTEGER DEFAULT 0,
  pdf_limit INTEGER NOT NULL,
  purchase_reference TEXT,
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
  external_id TEXT UNIQUE,
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
