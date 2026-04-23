
-- Add access_code to shared_diagnostics
ALTER TABLE public.shared_diagnostics 
ADD COLUMN IF NOT EXISTS access_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_diagnostics_access_code 
ON public.shared_diagnostics(access_code) 
WHERE access_code IS NOT NULL;

-- Allow authenticated users to look up a diagnostic by code (to join it)
CREATE POLICY "Anyone authenticated can find diagnostic by code"
ON public.shared_diagnostics
FOR SELECT
TO authenticated
USING (access_code IS NOT NULL);

-- Allow learners to claim a diagnostic via code (set themselves as learner_id when null)
CREATE POLICY "Learners can claim diagnostic via code"
ON public.shared_diagnostics
FOR UPDATE
TO authenticated
USING (access_code IS NOT NULL AND learner_id IS NULL)
WITH CHECK (learner_id = auth.uid());

-- Make learner_id nullable so a diagnostic can be created before learner joins
ALTER TABLE public.shared_diagnostics
ALTER COLUMN learner_id DROP NOT NULL;

-- Placement test sessions with access codes
CREATE TABLE IF NOT EXISTS public.placement_test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formateur_id UUID NOT NULL,
  learner_id UUID,
  access_code TEXT NOT NULL UNIQUE,
  candidate_name TEXT,
  candidate_email TEXT,
  test_result_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.placement_test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Formateurs manage their placement sessions"
ON public.placement_test_sessions
FOR ALL
TO authenticated
USING (formateur_id = auth.uid())
WITH CHECK (formateur_id = auth.uid());

CREATE POLICY "Admins manage placement sessions"
ON public.placement_test_sessions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can find placement session by code"
ON public.placement_test_sessions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Learners can claim placement via code"
ON public.placement_test_sessions
FOR UPDATE
TO authenticated
USING (learner_id IS NULL)
WITH CHECK (learner_id = auth.uid());

CREATE TRIGGER update_placement_test_sessions_updated_at
BEFORE UPDATE ON public.placement_test_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate a short unique access code (6 chars, alphanumeric, no ambiguous chars)
CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, (floor(random() * length(chars)) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$;
