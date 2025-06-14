
-- Primeiro, remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow admin insert" ON user_licenses;
DROP POLICY IF EXISTS "Allow user and admin select" ON user_licenses;
DROP POLICY IF EXISTS "Allow admin update" ON user_licenses;
DROP POLICY IF EXISTS "Allow admin delete" ON user_licenses;
DROP POLICY IF EXISTS "Users can view their own license" ON user_licenses;

-- Recriar a função is_admin_user de forma mais robusta
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

-- Política simples para SELECT - usuários veem suas licenças, admins veem tudo
CREATE POLICY "user_licenses_select_policy" ON user_licenses
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR 
  is_admin_user()
);

-- Política para INSERT - apenas admins
CREATE POLICY "user_licenses_insert_policy" ON user_licenses
FOR INSERT 
TO authenticated
WITH CHECK (is_admin_user());

-- Política para UPDATE - apenas admins
CREATE POLICY "user_licenses_update_policy" ON user_licenses
FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Política para DELETE - apenas admins
CREATE POLICY "user_licenses_delete_policy" ON user_licenses
FOR DELETE
TO authenticated
USING (is_admin_user());

-- Também precisamos de políticas para a tabela purchases
CREATE POLICY "purchases_select_policy" ON purchases
FOR SELECT 
TO authenticated
USING (is_admin_user());
