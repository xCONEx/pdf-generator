
-- Primeiro, remover as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Admins can insert licenses" ON user_licenses;
DROP POLICY IF EXISTS "Admins can view all licenses" ON user_licenses;
DROP POLICY IF EXISTS "Admins can update licenses" ON user_licenses;
DROP POLICY IF EXISTS "Users can view their own license" ON user_licenses;

-- Criar função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('adm.financeflow@gmail.com', 'yuriadrskt@gmail.com')
  );
$$;

-- Política para admins poderem inserir licenças
CREATE POLICY "Admins can insert licenses" ON user_licenses
FOR INSERT 
TO authenticated
WITH CHECK (is_admin_user());

-- Política para usuários verem suas próprias licenças e admins verem todas
CREATE POLICY "Users can view own licenses and admins can view all" ON user_licenses
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  (SELECT email FROM auth.users WHERE id = auth.uid()) = email
  OR 
  is_admin_user()
);

-- Política para admins atualizarem licenças
CREATE POLICY "Admins can update licenses" ON user_licenses
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR
  is_admin_user()
);

-- Política para admins deletarem licenças se necessário
CREATE POLICY "Admins can delete licenses" ON user_licenses
FOR DELETE
TO authenticated
USING (is_admin_user());
