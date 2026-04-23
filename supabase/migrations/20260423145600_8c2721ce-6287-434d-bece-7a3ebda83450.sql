-- Table principale: une session de diagnostic
CREATE TABLE public.shared_diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learner_id UUID NOT NULL,
  formateur_id UUID NOT NULL,
  learner_language TEXT NOT NULL DEFAULT 'fr',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_diagnostics ENABLE ROW LEVEL SECURITY;

-- Le formateur peut tout faire sur ses sessions
CREATE POLICY "Formateurs can manage their diagnostics"
ON public.shared_diagnostics FOR ALL TO authenticated
USING (formateur_id = auth.uid())
WITH CHECK (formateur_id = auth.uid());

-- L'apprenant peut voir et mettre à jour la sienne
CREATE POLICY "Learners can view their diagnostic"
ON public.shared_diagnostics FOR SELECT TO authenticated
USING (learner_id = auth.uid());

CREATE POLICY "Learners can update their diagnostic"
ON public.shared_diagnostics FOR UPDATE TO authenticated
USING (learner_id = auth.uid());

-- Admins
CREATE POLICY "Admins can manage all diagnostics"
ON public.shared_diagnostics FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Directeurs en lecture
CREATE POLICY "Directeurs can view all diagnostics"
ON public.shared_diagnostics FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'directeur'::app_role));

-- Table des réponses
CREATE TABLE public.shared_diagnostic_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES public.shared_diagnostics(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  answer_fr TEXT,
  answer_native TEXT,
  validated_by_learner BOOLEAN NOT NULL DEFAULT false,
  validated_by_formateur BOOLEAN NOT NULL DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (diagnostic_id, question_key)
);

ALTER TABLE public.shared_diagnostic_answers ENABLE ROW LEVEL SECURITY;

-- Le formateur de la session peut tout faire
CREATE POLICY "Formateurs can manage answers in their diagnostics"
ON public.shared_diagnostic_answers FOR ALL TO authenticated
USING (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE formateur_id = auth.uid()
  )
)
WITH CHECK (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE formateur_id = auth.uid()
  )
);

-- L'apprenant peut voir et mettre à jour ses réponses
CREATE POLICY "Learners can view their answers"
ON public.shared_diagnostic_answers FOR SELECT TO authenticated
USING (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE learner_id = auth.uid()
  )
);

CREATE POLICY "Learners can update their answers"
ON public.shared_diagnostic_answers FOR UPDATE TO authenticated
USING (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE learner_id = auth.uid()
  )
);

-- Admins / Directeurs
CREATE POLICY "Admins can manage all answers"
ON public.shared_diagnostic_answers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Directeurs can view all answers"
ON public.shared_diagnostic_answers FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'directeur'::app_role));

-- Triggers updated_at
CREATE TRIGGER update_shared_diagnostics_updated_at
BEFORE UPDATE ON public.shared_diagnostics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_diagnostic_answers_updated_at
BEFORE UPDATE ON public.shared_diagnostic_answers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour realtime / lookups
CREATE INDEX idx_shared_diagnostics_learner ON public.shared_diagnostics(learner_id);
CREATE INDEX idx_shared_diagnostics_formateur ON public.shared_diagnostics(formateur_id);
CREATE INDEX idx_shared_diagnostic_answers_diagnostic ON public.shared_diagnostic_answers(diagnostic_id);

-- Activer realtime
ALTER TABLE public.shared_diagnostics REPLICA IDENTITY FULL;
ALTER TABLE public.shared_diagnostic_answers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_diagnostics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_diagnostic_answers;