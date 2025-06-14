
-- Adicionar licença para o novo usuário administrador
INSERT INTO user_licenses (
  email,
  plan,
  status,
  expires_at,
  pdf_limit,
  pdfs_generated
) VALUES (
  'yuriadrskt@gmail.com',
  'premium',
  'active',
  NOW() + INTERVAL '1 year',
  9999,
  0
);
