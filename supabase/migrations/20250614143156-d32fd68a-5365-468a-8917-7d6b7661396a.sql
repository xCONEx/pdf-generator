
-- Primeiro, vamos dropar as políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Admins can insert licenses" ON user_licenses;
DROP POLICY IF EXISTS "Admins can view all licenses" ON user_licenses;
DROP POLICY IF EXISTS "Admins can update licenses" ON user_licenses;
DROP POLICY IF EXISTS "Admins can delete licenses" ON user_licenses;
DROP POLICY IF EXISTS "Users can view own licenses and admins can view all" ON user_licenses;

-- Recriar a função is_admin_user se não existir
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

-- Política mais simples para admins poderem inserir licenças
CREATE POLICY "Allow admin insert" ON user_licenses
FOR INSERT 
TO authenticated
WITH CHECK (is_admin_user());

-- Política para usuários verem suas próprias licenças OU admins verem todas
CREATE POLICY "Allow user and admin select" ON user_licenses
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR 
  is_admin_user()
);

-- Política para admins atualizarem qualquer licença
CREATE POLICY "Allow admin update" ON user_licenses
FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Política para admins deletarem licenças
CREATE POLICY "Allow admin delete" ON user_licenses
FOR DELETE
TO authenticated
USING (is_admin_user());
