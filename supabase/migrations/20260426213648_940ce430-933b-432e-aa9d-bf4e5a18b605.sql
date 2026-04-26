ALTER TABLE public.onboarding_results
  ADD COLUMN IF NOT EXISTS source_location_id TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_campaign TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS source_location_id TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_campaign TEXT;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source_location_id TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_campaign TEXT;

CREATE INDEX IF NOT EXISTS idx_onboarding_results_source_location_id ON public.onboarding_results(source_location_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_results_source_campaign ON public.onboarding_results(source_campaign);
CREATE INDEX IF NOT EXISTS idx_profiles_source_location_id ON public.profiles(source_location_id);
CREATE INDEX IF NOT EXISTS idx_profiles_source_campaign ON public.profiles(source_campaign);
CREATE INDEX IF NOT EXISTS idx_leads_source_location_id ON public.leads(source_location_id);
CREATE INDEX IF NOT EXISTS idx_leads_source_campaign ON public.leads(source_campaign);