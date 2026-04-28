CREATE TABLE IF NOT EXISTS public.provider_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  user_id UUID,
  role public.app_role NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'invited',
  invited_by UUID NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT provider_members_role_check CHECK (role IN ('benevole'::public.app_role, 'cip'::public.app_role, 'accueil'::public.app_role, 'formateur'::public.app_role)),
  CONSTRAINT provider_members_status_check CHECK (status IN ('invited', 'active', 'disabled')),
  CONSTRAINT provider_members_email_check CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT provider_members_provider_email_unique UNIQUE (provider_id, email),
  CONSTRAINT provider_members_provider_user_unique UNIQUE (provider_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_members_provider_id ON public.provider_members(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_members_user_id ON public.provider_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_provider_members_email ON public.provider_members(lower(email));

ALTER TABLE public.provider_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_provider_owner(_provider_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.training_providers tp
    WHERE tp.id = _provider_id
      AND tp.user_id = auth.uid()
  )
$$;

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
      AND pm.user_id = auth.uid()
      AND pm.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_provider(_provider_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_provider_owner(_provider_id)
    OR public.is_provider_member(_provider_id)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

CREATE POLICY "Admins can manage provider members"
ON public.provider_members
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Provider owners can view their members"
ON public.provider_members
FOR SELECT
TO authenticated
USING (public.is_provider_owner(provider_id));

CREATE POLICY "Provider owners can invite members"
ON public.provider_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_provider_owner(provider_id) AND invited_by = auth.uid());

CREATE POLICY "Provider owners can update their members"
ON public.provider_members
FOR UPDATE
TO authenticated
USING (public.is_provider_owner(provider_id))
WITH CHECK (public.is_provider_owner(provider_id));

CREATE POLICY "Provider owners can remove their members"
ON public.provider_members
FOR DELETE
TO authenticated
USING (public.is_provider_owner(provider_id));

CREATE POLICY "Members can view own membership"
ON public.provider_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'));

CREATE TRIGGER update_provider_members_updated_at
BEFORE UPDATE ON public.provider_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Provider teams can view their leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.can_access_provider(provider_id));

CREATE POLICY "Provider teams can update their leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (public.can_access_provider(provider_id))
WITH CHECK (public.can_access_provider(provider_id));

CREATE POLICY "Provider teams can view profiles of their leads"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.leads l
    WHERE l.profile_id = profiles.id
      AND public.can_access_provider(l.provider_id)
      AND l.purchased_at IS NOT NULL
  )
);