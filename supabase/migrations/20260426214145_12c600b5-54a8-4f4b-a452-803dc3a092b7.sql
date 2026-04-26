CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  direction TEXT NOT NULL,
  source_system TEXT NOT NULL,
  target_system TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'lead_status',
  diagnostic_id TEXT,
  profile_id UUID,
  lead_id UUID,
  hubspot_contact_id TEXT,
  hubspot_deal_id TEXT,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  hubspot_dealstage TEXT,
  conflict_resolution TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  payload_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
ON public.sync_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_diagnostic_id ON public.sync_logs (diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_hubspot_contact_id ON public.sync_logs (hubspot_contact_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_direction ON public.sync_logs (direction);

ALTER TABLE public.onboarding_results
  ADD COLUMN IF NOT EXISTS statut_lead TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_deal_id TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_from TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS statut_lead TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_deal_id TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_from TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS statut_lead TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS hubspot_deal_id TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_from TEXT,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_onboarding_results_hubspot_contact_id ON public.onboarding_results (hubspot_contact_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_results_statut_lead ON public.onboarding_results (statut_lead);
CREATE INDEX IF NOT EXISTS idx_profiles_hubspot_contact_id ON public.profiles (hubspot_contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_hubspot_contact_id ON public.leads (hubspot_contact_id);