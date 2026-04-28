CREATE OR REPLACE FUNCTION public.is_provider_member(_provider_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.provider_members pm
    WHERE pm.provider_id = _provider_id
      AND (
        pm.user_id = auth.uid()
        OR lower(pm.email) = lower(auth.jwt() ->> 'email')
      )
      AND pm.status <> 'disabled'
  )
$$;

CREATE POLICY "Members can activate own membership"
ON public.provider_members
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
WITH CHECK (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'));

GRANT EXECUTE ON FUNCTION public.is_provider_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_provider_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_provider(uuid) TO authenticated;