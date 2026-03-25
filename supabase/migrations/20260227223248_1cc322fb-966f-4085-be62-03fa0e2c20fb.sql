-- Drop old restrictive user policy (now merged into the new one)
DROP POLICY "Users can view their own profile" ON public.profiles;

-- Drop current policy and recreate as PERMISSIVE
DROP POLICY "Providers can view profiles of their leads" ON public.profiles;

-- User can view own profile (permissive)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Provider can view profiles of their leads (permissive)  
CREATE POLICY "Providers can view profiles of their leads"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_provider_for_profile(id));