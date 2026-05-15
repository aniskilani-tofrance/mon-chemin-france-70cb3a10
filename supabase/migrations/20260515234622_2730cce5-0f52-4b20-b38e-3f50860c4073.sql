ALTER TABLE public.placement_test_sessions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER NOT NULL DEFAULT 0;

UPDATE public.placement_test_sessions
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_placement_sessions_expires
  ON public.placement_test_sessions (expires_at) WHERE status = 'pending';