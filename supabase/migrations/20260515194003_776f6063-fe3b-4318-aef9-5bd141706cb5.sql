-- Historique d'évènements de suivi pour les bénéficiaires (timeline conseiller)
CREATE TABLE public.onboarding_follow_up_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_result_id UUID NOT NULL,
  advisor_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('status_change','call','whatsapp','note','callback_done','assignment')),
  from_status public.follow_up_status,
  to_status public.follow_up_status,
  note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_followup_events_result ON public.onboarding_follow_up_events (onboarding_result_id, created_at DESC);

ALTER TABLE public.onboarding_follow_up_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conseillers and admins can view follow-up events"
ON public.onboarding_follow_up_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'conseiller'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Conseillers and admins can insert follow-up events"
ON public.onboarding_follow_up_events
FOR INSERT
TO authenticated
WITH CHECK (
  (public.has_role(auth.uid(), 'conseiller'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
  AND (advisor_id IS NULL OR advisor_id = auth.uid())
);
