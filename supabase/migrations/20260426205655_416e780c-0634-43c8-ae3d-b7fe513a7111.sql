CREATE TABLE IF NOT EXISTS public.hubspot_diagnostic_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_type TEXT NOT NULL CHECK (diagnostic_type IN ('marianne', 'shared_diagnostic')),
  diagnostic_id TEXT NOT NULL,
  hubspot_contact_id TEXT,
  hubspot_company_id TEXT,
  hubspot_deal_id TEXT,
  score_qualification INTEGER CHECK (score_qualification IS NULL OR (score_qualification >= 0 AND score_qualification <= 100)),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'warning')),
  error_message TEXT,
  payload_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hubspot_diagnostic_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view HubSpot diagnostic sync logs"
ON public.hubspot_diagnostic_sync_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_hubspot_sync_logs_diagnostic
ON public.hubspot_diagnostic_sync_logs (diagnostic_type, diagnostic_id);

CREATE INDEX IF NOT EXISTS idx_hubspot_sync_logs_created_at
ON public.hubspot_diagnostic_sync_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hubspot_sync_logs_status
ON public.hubspot_diagnostic_sync_logs (status);