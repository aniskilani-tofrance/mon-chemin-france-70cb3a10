
-- 1. formateur_learners table
CREATE TABLE public.formateur_learners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (formateur_id, learner_id)
);
ALTER TABLE public.formateur_learners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Formateurs can view their learners"
  ON public.formateur_learners FOR SELECT TO authenticated
  USING (formateur_id = auth.uid());

CREATE POLICY "Formateurs can add learners"
  ON public.formateur_learners FOR INSERT TO authenticated
  WITH CHECK (formateur_id = auth.uid() AND public.has_role(auth.uid(), 'formateur'));

CREATE POLICY "Formateurs can remove learners"
  ON public.formateur_learners FOR DELETE TO authenticated
  USING (formateur_id = auth.uid());

CREATE POLICY "Admins can manage formateur_learners"
  ON public.formateur_learners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Directeurs can view formateur_learners"
  ON public.formateur_learners FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));

-- 2. assignments table
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.fle_modules(id) ON DELETE CASCADE,
  learner_id uuid NOT NULL,
  assigned_by uuid NOT NULL,
  due_date timestamptz,
  status public.assignment_status NOT NULL DEFAULT 'a_faire',
  score integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Formateurs can view assignments for their learners"
  ON public.assignments FOR SELECT TO authenticated
  USING (
    assigned_by = auth.uid()
    OR learner_id IN (SELECT fl.learner_id FROM public.formateur_learners fl WHERE fl.formateur_id = auth.uid())
  );

CREATE POLICY "Formateurs can create assignments"
  ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (
    assigned_by = auth.uid()
    AND public.has_role(auth.uid(), 'formateur')
    AND learner_id IN (SELECT fl.learner_id FROM public.formateur_learners fl WHERE fl.formateur_id = auth.uid())
  );

CREATE POLICY "Formateurs can update their assignments"
  ON public.assignments FOR UPDATE TO authenticated
  USING (assigned_by = auth.uid());

CREATE POLICY "Formateurs can delete their assignments"
  ON public.assignments FOR DELETE TO authenticated
  USING (assigned_by = auth.uid());

CREATE POLICY "Learners can view own assignments"
  ON public.assignments FOR SELECT TO authenticated
  USING (learner_id = auth.uid());

CREATE POLICY "Learners can update own assignment status"
  ON public.assignments FOR UPDATE TO authenticated
  USING (learner_id = auth.uid());

CREATE POLICY "Admins can manage assignments"
  ON public.assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Directeurs can view all assignments"
  ON public.assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));

-- 3. audio_submissions table
CREATE TABLE public.audio_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.fle_modules(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.fle_exercises(id) ON DELETE SET NULL,
  audio_url text NOT NULL,
  status public.audio_review_status NOT NULL DEFAULT 'pending',
  formateur_comment text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audio_submissions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_audio_submissions_updated_at
  BEFORE UPDATE ON public.audio_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Learners can submit audio"
  ON public.audio_submissions FOR INSERT TO authenticated
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Learners can view own submissions"
  ON public.audio_submissions FOR SELECT TO authenticated
  USING (learner_id = auth.uid());

CREATE POLICY "Formateurs can view learner submissions"
  ON public.audio_submissions FOR SELECT TO authenticated
  USING (
    learner_id IN (SELECT fl.learner_id FROM public.formateur_learners fl WHERE fl.formateur_id = auth.uid())
  );

CREATE POLICY "Formateurs can review submissions"
  ON public.audio_submissions FOR UPDATE TO authenticated
  USING (
    learner_id IN (SELECT fl.learner_id FROM public.formateur_learners fl WHERE fl.formateur_id = auth.uid())
  );

CREATE POLICY "Admins can manage audio_submissions"
  ON public.audio_submissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Directeurs can view all audio_submissions"
  ON public.audio_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));

-- 4. afest_observations table
CREATE TABLE public.afest_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL,
  formateur_id uuid NOT NULL,
  observation_date date NOT NULL DEFAULT CURRENT_DATE,
  situation text NOT NULL,
  competences jsonb NOT NULL DEFAULT '[]'::jsonb,
  appreciation integer NOT NULL DEFAULT 2,
  commentaire text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.afest_observations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_afest_observations_updated_at
  BEFORE UPDATE ON public.afest_observations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_afest_appreciation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.appreciation < 1 OR NEW.appreciation > 4 THEN
    RAISE EXCEPTION 'appreciation must be between 1 and 4';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_afest_appreciation_trigger
  BEFORE INSERT OR UPDATE ON public.afest_observations
  FOR EACH ROW EXECUTE FUNCTION public.validate_afest_appreciation();

CREATE POLICY "Formateurs can view their observations"
  ON public.afest_observations FOR SELECT TO authenticated
  USING (formateur_id = auth.uid());

CREATE POLICY "Formateurs can create observations"
  ON public.afest_observations FOR INSERT TO authenticated
  WITH CHECK (
    formateur_id = auth.uid()
    AND public.has_role(auth.uid(), 'formateur')
    AND learner_id IN (SELECT fl.learner_id FROM public.formateur_learners fl WHERE fl.formateur_id = auth.uid())
  );

CREATE POLICY "Formateurs can update their observations"
  ON public.afest_observations FOR UPDATE TO authenticated
  USING (formateur_id = auth.uid());

CREATE POLICY "Formateurs can delete their observations"
  ON public.afest_observations FOR DELETE TO authenticated
  USING (formateur_id = auth.uid());

CREATE POLICY "Learners can view their observations"
  ON public.afest_observations FOR SELECT TO authenticated
  USING (learner_id = auth.uid());

CREATE POLICY "Admins can manage afest_observations"
  ON public.afest_observations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Directeurs can view all afest_observations"
  ON public.afest_observations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));

-- 5. Storage bucket for audio submissions
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-submissions', 'audio-submissions', false);

CREATE POLICY "Users can upload their own audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users and staff can view audio"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'audio-submissions'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'formateur')
      OR public.has_role(auth.uid(), 'directeur')
    )
  );

-- 6. Helper function
CREATE OR REPLACE FUNCTION public.is_formateur_for(_learner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.formateur_learners
    WHERE formateur_id = auth.uid()
      AND learner_id = _learner_id
  )
$$;

-- 7. Allow formateurs to read existing FLE tables for their learners
CREATE POLICY "Formateurs can view learner progress"
  ON public.fle_user_progress FOR SELECT TO authenticated
  USING (public.is_formateur_for(user_id));

CREATE POLICY "Formateurs can view learner module progress"
  ON public.fle_module_progress FOR SELECT TO authenticated
  USING (public.is_formateur_for(user_id));

CREATE POLICY "Formateurs can view learner exercise results"
  ON public.fle_exercise_results FOR SELECT TO authenticated
  USING (public.is_formateur_for(user_id));

CREATE POLICY "Formateurs can view learner sessions"
  ON public.fle_sessions FOR SELECT TO authenticated
  USING (public.is_formateur_for(user_id));

CREATE POLICY "Formateurs can view learner level history"
  ON public.fle_level_history FOR SELECT TO authenticated
  USING (public.is_formateur_for(user_id));

CREATE POLICY "Formateurs can view learner badges"
  ON public.fle_user_badges FOR SELECT TO authenticated
  USING (public.is_formateur_for(user_id));

-- 8. Directeurs read-only on existing FLE tables
CREATE POLICY "Directeurs can view all user progress"
  ON public.fle_user_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));

CREATE POLICY "Directeurs can view all module progress"
  ON public.fle_module_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));

CREATE POLICY "Directeurs can view all exercise results"
  ON public.fle_exercise_results FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));

CREATE POLICY "Directeurs can view all sessions"
  ON public.fle_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'directeur'));
