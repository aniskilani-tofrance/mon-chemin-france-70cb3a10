
-- Table to track FLE learning sessions (time spent)
CREATE TABLE public.fle_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  duration_seconds integer DEFAULT 0,
  module_id uuid REFERENCES public.fle_modules(id) ON DELETE SET NULL,
  activity_type text NOT NULL DEFAULT 'exercise',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fle_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own sessions"
  ON public.fle_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON public.fle_sessions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own sessions"
  ON public.fle_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON public.fle_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_fle_sessions_user_id ON public.fle_sessions(user_id);
CREATE INDEX idx_fle_sessions_started_at ON public.fle_sessions(started_at);
