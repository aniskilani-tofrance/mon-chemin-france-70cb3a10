
CREATE TABLE public.tts_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_id TEXT,
  provider TEXT NOT NULL,
  language TEXT,
  voice_id TEXT,
  status_code INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  latency_ms INTEGER,
  attempt INTEGER,
  error_message TEXT,
  text_chars INTEGER,
  circuit_open BOOLEAN DEFAULT false
);

CREATE INDEX idx_tts_logs_created_at ON public.tts_logs (created_at DESC);
CREATE INDEX idx_tts_logs_provider ON public.tts_logs (provider, created_at DESC);

ALTER TABLE public.tts_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read tts logs"
  ON public.tts_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Service role bypass RLS, no insert policy needed for clients
