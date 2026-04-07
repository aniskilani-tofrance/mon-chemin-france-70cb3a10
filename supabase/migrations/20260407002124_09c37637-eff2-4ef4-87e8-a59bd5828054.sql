
-- 1. Create onboarding_results table
CREATE TABLE public.onboarding_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  email text,
  language text NOT NULL DEFAULT 'fr',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  french_level_cecrl varchar,
  main_goal varchar,
  target_sector varchar,
  lead_route varchar,
  lead_score integer,
  distance_to_job integer,
  work_right varchar,
  literacy varchar,
  barriers text[],
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.onboarding_results ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY "Anon can insert onboarding results"
ON public.onboarding_results FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated can insert onboarding results"
ON public.onboarding_results FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own onboarding results"
ON public.onboarding_results FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all onboarding results"
ON public.onboarding_results FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Index for fast lookups
CREATE INDEX idx_onboarding_results_email ON public.onboarding_results (email);
CREATE INDEX idx_onboarding_results_user_id ON public.onboarding_results (user_id);

-- 5. Drop redundant columns from fle_user_progress
ALTER TABLE public.fle_user_progress DROP COLUMN IF EXISTS badges_earned;
ALTER TABLE public.fle_user_progress DROP COLUMN IF EXISTS target_sector;
