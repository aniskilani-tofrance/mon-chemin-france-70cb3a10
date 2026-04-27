ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS slack_reminder_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_leads_slack_reminder_status
ON public.leads (status_updated_at, slack_reminder_sent_at)
WHERE status_updated_at IS NOT NULL;