-- Drop the recursive policy
DROP POLICY "Providers can view profiles of their leads" ON public.profiles;

-- Recreate without recursion: use a security definer function
CREATE OR REPLACE FUNCTION public.is_provider_for_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM leads l
    JOIN training_providers tp ON tp.id = l.provider_id
    WHERE l.profile_id = _profile_id
      AND tp.user_id = auth.uid()
  );
$$;

CREATE POLICY "Providers can view profiles of their leads"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.is_provider_for_profile(id)
);