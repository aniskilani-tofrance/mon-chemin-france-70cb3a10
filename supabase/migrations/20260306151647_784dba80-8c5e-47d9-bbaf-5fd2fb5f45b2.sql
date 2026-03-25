
-- Analytics events table for funnel tracking
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  page text,
  language text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying by event type and time
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);

-- RLS: allow anonymous inserts, admin reads
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
