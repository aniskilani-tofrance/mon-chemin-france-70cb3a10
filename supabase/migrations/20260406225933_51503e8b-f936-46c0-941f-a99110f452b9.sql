
CREATE TABLE public.test_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_name text NOT NULL,
  candidate_email text NOT NULL,
  candidate_phone text,
  score numeric NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'A1',
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds integer NOT NULL DEFAULT 0,
  gdpr_consent boolean NOT NULL DEFAULT false,
  trainer_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert test results"
ON public.test_results
FOR INSERT
TO anon, authenticated
WITH CHECK (
  gdpr_consent = true
  AND length(candidate_name) <= 200
  AND length(candidate_email) <= 255
  AND candidate_email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "Admins can view all test results"
ON public.test_results
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read own results by id"
ON public.test_results
FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX idx_test_results_email ON public.test_results (candidate_email);
CREATE INDEX idx_test_results_created ON public.test_results (created_at DESC);
