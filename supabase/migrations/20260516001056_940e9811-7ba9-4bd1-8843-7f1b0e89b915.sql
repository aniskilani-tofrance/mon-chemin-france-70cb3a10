-- Notifications envoyées par un formateur à ses apprenants
CREATE TABLE IF NOT EXISTS public.learner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id UUID NOT NULL,
  learner_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'info',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learner_notifications_learner ON public.learner_notifications(learner_id, read_at);
CREATE INDEX IF NOT EXISTS idx_learner_notifications_formateur ON public.learner_notifications(formateur_id, created_at DESC);

ALTER TABLE public.learner_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage learner_notifications"
  ON public.learner_notifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Directeurs view learner_notifications"
  ON public.learner_notifications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'::public.app_role));

CREATE POLICY "Formateurs send notifications to their learners"
  ON public.learner_notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    formateur_id = auth.uid()
    AND public.is_formateur_for(learner_id)
  );

CREATE POLICY "Formateurs view notifications they sent"
  ON public.learner_notifications
  FOR SELECT TO authenticated
  USING (formateur_id = auth.uid());

CREATE POLICY "Formateurs delete notifications they sent"
  ON public.learner_notifications
  FOR DELETE TO authenticated
  USING (formateur_id = auth.uid());

CREATE POLICY "Learners view their notifications"
  ON public.learner_notifications
  FOR SELECT TO authenticated
  USING (learner_id = auth.uid());

CREATE POLICY "Learners can mark their notifications as read"
  ON public.learner_notifications
  FOR UPDATE TO authenticated
  USING (learner_id = auth.uid())
  WITH CHECK (learner_id = auth.uid());
