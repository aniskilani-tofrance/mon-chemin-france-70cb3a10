CREATE TABLE public.marianne_access_code_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code_id UUID,
  code TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marianne_access_code_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view Marianne access code audit logs"
ON public.marianne_access_code_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_marianne_audit_logs_code_created_at
ON public.marianne_access_code_audit_logs (code, created_at DESC);

CREATE INDEX idx_marianne_audit_logs_user_id_created_at
ON public.marianne_access_code_audit_logs (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.validate_marianne_access_code(
  _code TEXT,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  normalized_code TEXT;
  code_row public.marianne_access_codes%ROWTYPE;
  current_user_id UUID;
  parsed_ip INET;
  failure_reason TEXT;
BEGIN
  normalized_code := upper(regexp_replace(coalesce(_code, ''), '[^A-Z0-9]', '', 'g'));
  current_user_id := auth.uid();

  BEGIN
    parsed_ip := NULLIF(_ip_address, '')::INET;
  EXCEPTION WHEN OTHERS THEN
    parsed_ip := NULL;
  END;

  IF length(normalized_code) < 4 OR length(normalized_code) > 12 THEN
    INSERT INTO public.marianne_access_code_audit_logs (code, user_id, ip_address, user_agent, success, reason)
    VALUES (normalized_code, current_user_id, parsed_ip, _user_agent, false, 'invalid_format');
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_format');
  END IF;

  SELECT * INTO code_row
  FROM public.marianne_access_codes
  WHERE code = normalized_code
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.marianne_access_code_audit_logs (code, user_id, ip_address, user_agent, success, reason)
    VALUES (normalized_code, current_user_id, parsed_ip, _user_agent, false, 'not_found');
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF NOT code_row.is_active THEN
    failure_reason := 'inactive';
  ELSIF code_row.expires_at IS NOT NULL AND code_row.expires_at <= now() THEN
    failure_reason := 'expired';
  ELSIF code_row.used_count >= code_row.max_uses THEN
    failure_reason := 'used';
  END IF;

  IF failure_reason IS NOT NULL THEN
    INSERT INTO public.marianne_access_code_audit_logs (access_code_id, code, user_id, ip_address, user_agent, success, reason)
    VALUES (code_row.id, normalized_code, current_user_id, parsed_ip, _user_agent, false, failure_reason);
    RETURN jsonb_build_object('valid', false, 'reason', failure_reason);
  END IF;

  UPDATE public.marianne_access_codes
  SET used_count = used_count + 1,
      last_used_at = now(),
      updated_at = now(),
      is_active = CASE WHEN used_count + 1 >= max_uses THEN false ELSE is_active END
  WHERE id = code_row.id;

  INSERT INTO public.marianne_access_code_audit_logs (access_code_id, code, user_id, ip_address, user_agent, success, reason)
  VALUES (code_row.id, normalized_code, current_user_id, parsed_ip, _user_agent, true, 'consumed');

  RETURN jsonb_build_object('valid', true, 'code', normalized_code);
END;
$function$;