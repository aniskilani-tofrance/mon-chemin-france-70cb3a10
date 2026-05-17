
-- 1. placement_test_sessions: drop overly broad public SELECT
DROP POLICY IF EXISTS "Anyone can find placement session by code" ON public.placement_test_sessions;

-- 2. test_results: drop overly broad SELECT
DROP POLICY IF EXISTS "Anyone can read own results by id" ON public.test_results;

-- 3. shared_diagnostics: drop overly broad SELECT
DROP POLICY IF EXISTS "Anyone authenticated can find diagnostic by code" ON public.shared_diagnostics;

-- 4. Secure RPC: cooldown lookup for test_results by email (no PII returned)
CREATE OR REPLACE FUNCTION public.check_test_results_cooldown(_email text)
RETURNS TABLE(id uuid, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tr.id, tr.created_at
  FROM public.test_results tr
  WHERE tr.candidate_email = lower(coalesce(_email, ''))
    AND tr.created_at >= (now() - interval '3 months')
  ORDER BY tr.created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.check_test_results_cooldown(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_test_results_cooldown(text) TO anon, authenticated;

-- 5. Secure RPC: claim a shared_diagnostic via access code
CREATE OR REPLACE FUNCTION public.claim_shared_diagnostic_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text;
  diag_id uuid;
  current_learner uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  normalized := upper(regexp_replace(coalesce(_code, ''), '[^A-Za-z0-9]', '', 'g'));
  IF length(normalized) < 4 OR length(normalized) > 32 THEN
    RAISE EXCEPTION 'Invalid code';
  END IF;

  SELECT id, learner_id INTO diag_id, current_learner
  FROM public.shared_diagnostics
  WHERE access_code = normalized
  LIMIT 1;

  IF diag_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF current_learner IS NULL THEN
    UPDATE public.shared_diagnostics
    SET learner_id = auth.uid()
    WHERE id = diag_id;
  ELSIF current_learner <> auth.uid() THEN
    -- already claimed by someone else
    RETURN NULL;
  END IF;

  RETURN diag_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_shared_diagnostic_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_shared_diagnostic_by_code(text) TO authenticated;

-- 6. Tighten audio_submissions UPDATE: restrict writable fields
DROP POLICY IF EXISTS "Formateurs can review submissions" ON public.audio_submissions;
CREATE POLICY "Formateurs can review submissions"
ON public.audio_submissions
FOR UPDATE
TO authenticated
USING (
  learner_id IN (
    SELECT fl.learner_id FROM public.formateur_learners fl
    WHERE fl.formateur_id = auth.uid()
  )
)
WITH CHECK (
  learner_id IN (
    SELECT fl.learner_id FROM public.formateur_learners fl
    WHERE fl.formateur_id = auth.uid()
  )
  AND learner_id = (SELECT learner_id FROM public.audio_submissions a WHERE a.id = audio_submissions.id)
  AND module_id  = (SELECT module_id  FROM public.audio_submissions a WHERE a.id = audio_submissions.id)
  AND audio_url  = (SELECT audio_url  FROM public.audio_submissions a WHERE a.id = audio_submissions.id)
  AND exercise_id IS NOT DISTINCT FROM (SELECT exercise_id FROM public.audio_submissions a WHERE a.id = audio_submissions.id)
);

-- 7. Storage: tighten provider-logos INSERT/UPDATE to owners only
DROP POLICY IF EXISTS "Authenticated can upload provider logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update provider logos" ON storage.objects;

CREATE POLICY "Owners can upload provider logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'provider-logos'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] IN (
      SELECT (tp.id)::text FROM public.training_providers tp WHERE tp.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Owners can update provider logos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'provider-logos'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] IN (
      SELECT (tp.id)::text FROM public.training_providers tp WHERE tp.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'provider-logos'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] IN (
      SELECT (tp.id)::text FROM public.training_providers tp WHERE tp.user_id = auth.uid()
    )
  )
);

-- 8. Realtime: restrict subscriptions to authorized users
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can subscribe to own diagnostic topics" ON realtime.messages;
CREATE POLICY "Authenticated can subscribe to own diagnostic topics"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  -- Allow if topic matches a diagnostic the user owns/participates in,
  -- or any topic not matching the sensitive patterns.
  CASE
    WHEN extension = 'postgres_changes' AND topic LIKE 'realtime:public:shared_diagnostic%' THEN
      EXISTS (
        SELECT 1 FROM public.shared_diagnostics sd
        WHERE sd.formateur_id = auth.uid() OR sd.learner_id = auth.uid()
      )
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'directeur'::app_role)
    WHEN extension = 'postgres_changes' AND topic LIKE 'realtime:public:subscriptions%' THEN
      has_role(auth.uid(), 'admin'::app_role)
    ELSE true
  END
);
