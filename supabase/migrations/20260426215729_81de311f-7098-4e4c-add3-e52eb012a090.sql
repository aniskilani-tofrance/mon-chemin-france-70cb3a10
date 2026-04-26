ALTER TABLE public.onboarding_results
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS idx_onboarding_results_phone ON public.onboarding_results (phone);
CREATE INDEX IF NOT EXISTS idx_onboarding_results_first_name ON public.onboarding_results (first_name);