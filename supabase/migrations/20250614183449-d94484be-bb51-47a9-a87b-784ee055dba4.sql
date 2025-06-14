
-- Add unique constraint on user_id for company_profiles table
ALTER TABLE public.company_profiles 
ADD CONSTRAINT company_profiles_user_id_unique UNIQUE (user_id);
