
-- Atualizar a constraint para permitir o plano 'enterprise'
ALTER TABLE user_licenses DROP CONSTRAINT user_licenses_plan_check;
ALTER TABLE user_licenses ADD CONSTRAINT user_licenses_plan_check CHECK (plan IN ('basic', 'premium', 'enterprise'));
