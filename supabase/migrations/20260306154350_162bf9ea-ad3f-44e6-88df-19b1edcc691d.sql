-- 1. Fix is_provider_for_profile: only allow access for purchased leads
CREATE OR REPLACE FUNCTION public.is_provider_for_profile(_profile_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM leads l
    JOIN training_providers tp ON tp.id = l.provider_id
    WHERE l.profile_id = _profile_id
      AND tp.user_id = auth.uid()
      AND l.purchased_at IS NOT NULL
  );
$$;

-- 2. Fix provider visibility: drop overly permissive policy that exposes all providers to all providers
DROP POLICY IF EXISTS "Admins and providers can view training providers" ON public.training_providers;