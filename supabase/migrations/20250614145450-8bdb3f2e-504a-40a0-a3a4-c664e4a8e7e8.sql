
-- Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "user_licenses_select_policy" ON user_licenses;
DROP POLICY IF EXISTS "user_licenses_insert_policy" ON user_licenses;
DROP POLICY IF EXISTS "user_licenses_update_policy" ON user_licenses;
DROP POLICY IF EXISTS "user_licenses_delete_policy" ON user_licenses;
DROP POLICY IF EXISTS "purchases_select_policy" ON purchases;

-- Recriar a função is_admin_user de forma mais simples
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.email() IN ('adm.financeflow@gmail.com', 'yuriadrskt@gmail.com');
$$;

-- Políticas mais simples para user_licenses
CREATE POLICY "allow_user_own_licenses" ON user_licenses
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  email = auth.email()
  OR 
  is_admin_user()
);

CREATE POLICY "allow_admin_insert_licenses" ON user_licenses
FOR INSERT 
TO authenticated
WITH CHECK (is_admin_user());

CREATE POLICY "allow_admin_update_licenses" ON user_licenses
FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "allow_admin_delete_licenses" ON user_licenses
FOR DELETE
TO authenticated
USING (is_admin_user());

-- Política simples para purchases
CREATE POLICY "allow_admin_view_purchases" ON purchases
FOR SELECT 
TO authenticated
USING (is_admin_user());
