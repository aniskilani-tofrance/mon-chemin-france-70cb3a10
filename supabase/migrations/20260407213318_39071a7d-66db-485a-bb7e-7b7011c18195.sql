
CREATE TABLE public.fle_level_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  level public.cecrl_level NOT NULL,
  previous_level public.cecrl_level,
  reason text NOT NULL DEFAULT 'manual',
  changed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fle_level_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own level history"
  ON public.fle_level_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own level history"
  ON public.fle_level_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all level history"
  ON public.fle_level_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_fle_level_history_user ON public.fle_level_history(user_id, changed_at DESC);
