
-- Criar políticas RLS para permitir que admins gerenciem licenças

-- Política para permitir que admins insiram licenças (sem user_id inicialmente)
CREATE POLICY "Admins can insert licenses" ON user_licenses
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_licenses 
    WHERE user_id = auth.uid() 
    AND email IN ('adm.financeflow@gmail.com', 'yuriadrskt@gmail.com')
    AND status = 'active'
  )
  OR
  -- Permitir inserção se o usuário autenticado é um dos emails admin
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('adm.financeflow@gmail.com', 'yuriadrskt@gmail.com')
);

-- Política para permitir que admins vejam todas as licenças
CREATE POLICY "Admins can view all licenses" ON user_licenses
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id
  OR
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('adm.financeflow@gmail.com', 'yuriadrskt@gmail.com')
);

-- Política para permitir que admins atualizem licenças
CREATE POLICY "Admins can update licenses" ON user_licenses
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR
  (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('adm.financeflow@gmail.com', 'yuriadrskt@gmail.com')
);
