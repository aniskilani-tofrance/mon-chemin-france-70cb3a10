CREATE TABLE IF NOT EXISTS public.marianne_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marianne_access_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_marianne_access_codes_code ON public.marianne_access_codes (code);
CREATE INDEX IF NOT EXISTS idx_marianne_access_codes_active_expiry ON public.marianne_access_codes (is_active, expires_at);

DROP POLICY IF EXISTS "Admins can manage Marianne access codes" ON public.marianne_access_codes;
CREATE POLICY "Admins can manage Marianne access codes"
ON public.marianne_access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_marianne_access_code(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code TEXT;
  code_row public.marianne_access_codes%ROWTYPE;
BEGIN
  normalized_code := upper(regexp_replace(coalesce(_code, ''), '[^A-Z0-9]', '', 'g'));

  IF length(normalized_code) < 4 OR length(normalized_code) > 12 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_format');
  END IF;

  SELECT * INTO code_row
  FROM public.marianne_access_codes
  WHERE code = normalized_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF NOT code_row.is_active THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'inactive');
  END IF;

  IF code_row.expires_at IS NOT NULL AND code_row.expires_at <= now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'expired');
  END IF;

  IF code_row.used_count >= code_row.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'used');
  END IF;

  UPDATE public.marianne_access_codes
  SET used_count = used_count + 1,
      last_used_at = now(),
      updated_at = now(),
      is_active = CASE WHEN used_count + 1 >= max_uses THEN false ELSE is_active END
  WHERE id = code_row.id;

  RETURN jsonb_build_object('valid', true, 'code', normalized_code);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_marianne_access_code(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code TEXT;
  code_row public.marianne_access_codes%ROWTYPE;
BEGIN
  normalized_code := upper(regexp_replace(coalesce(_code, ''), '[^A-Z0-9]', '', 'g'));

  IF length(normalized_code) < 4 OR length(normalized_code) > 12 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_format');
  END IF;

  SELECT * INTO code_row
  FROM public.marianne_access_codes
  WHERE code = normalized_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF NOT code_row.is_active THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'inactive');
  END IF;

  IF code_row.expires_at IS NOT NULL AND code_row.expires_at <= now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'expired');
  END IF;

  IF code_row.used_count >= code_row.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'used');
  END IF;

  RETURN jsonb_build_object('valid', true, 'code', normalized_code);
END;
$$;

DROP TRIGGER IF EXISTS update_marianne_access_codes_updated_at ON public.marianne_access_codes;
CREATE TRIGGER update_marianne_access_codes_updated_at
BEFORE UPDATE ON public.marianne_access_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.marianne_access_codes (code, label, expires_at, max_uses)
VALUES ('TOFRCE', 'Code pilote Marianne initial', now() + interval '30 days', 100)
ON CONFLICT (code) DO NOTHING;