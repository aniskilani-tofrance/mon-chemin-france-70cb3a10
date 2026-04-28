CREATE TABLE IF NOT EXISTS public.shared_diagnostic_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES public.shared_diagnostics(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  activities TEXT[] NOT NULL DEFAULT '{}',
  detected_competences JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT shared_diagnostic_experiences_category_check CHECK (category IN ('travail', 'famille', 'benevolat', 'pays_origine')),
  CONSTRAINT shared_diagnostic_experiences_description_length CHECK (char_length(description) <= 5000),
  UNIQUE (diagnostic_id, category)
);

CREATE TABLE IF NOT EXISTS public.shared_diagnostic_competence_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES public.shared_diagnostics(id) ON DELETE CASCADE,
  competence_key TEXT NOT NULL,
  competence_label TEXT NOT NULL,
  domain TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'repéré',
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  detected_from TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT shared_diagnostic_competence_scores_score_check CHECK (score >= 0 AND score <= 100),
  CONSTRAINT shared_diagnostic_competence_scores_level_check CHECK (level IN ('repéré', 'émergent', 'opérationnel', 'maîtrise')),
  UNIQUE (diagnostic_id, competence_key)
);

ALTER TABLE public.shared_diagnostic_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_diagnostic_competence_scores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_shared_diagnostic_experiences_diagnostic ON public.shared_diagnostic_experiences(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_shared_diagnostic_experiences_category ON public.shared_diagnostic_experiences(category);
CREATE INDEX IF NOT EXISTS idx_shared_diagnostic_competence_scores_diagnostic ON public.shared_diagnostic_competence_scores(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_shared_diagnostic_competence_scores_score ON public.shared_diagnostic_competence_scores(score DESC);

CREATE TRIGGER update_shared_diagnostic_experiences_updated_at
BEFORE UPDATE ON public.shared_diagnostic_experiences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_diagnostic_competence_scores_updated_at
BEFORE UPDATE ON public.shared_diagnostic_competence_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Formateurs can manage experiences in their diagnostics"
ON public.shared_diagnostic_experiences
FOR ALL TO authenticated
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

CREATE POLICY "Learners can view their experiences"
ON public.shared_diagnostic_experiences
FOR SELECT TO authenticated
USING (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE learner_id = auth.uid()
  )
);

CREATE POLICY "Learners can upsert their experiences"
ON public.shared_diagnostic_experiences
FOR INSERT TO authenticated
WITH CHECK (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE learner_id = auth.uid()
  )
);

CREATE POLICY "Learners can update their experiences"
ON public.shared_diagnostic_experiences
FOR UPDATE TO authenticated
USING (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE learner_id = auth.uid()
  )
)
WITH CHECK (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE learner_id = auth.uid()
  )
);

CREATE POLICY "Directeurs can view all experiences"
ON public.shared_diagnostic_experiences
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'directeur'::public.app_role));

CREATE POLICY "Admins can manage all experiences"
ON public.shared_diagnostic_experiences
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Formateurs can manage competence scores in their diagnostics"
ON public.shared_diagnostic_competence_scores
FOR ALL TO authenticated
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

CREATE POLICY "Learners can view their competence scores"
ON public.shared_diagnostic_competence_scores
FOR SELECT TO authenticated
USING (
  diagnostic_id IN (
    SELECT id FROM public.shared_diagnostics WHERE learner_id = auth.uid()
  )
);

CREATE POLICY "Directeurs can view all competence scores"
ON public.shared_diagnostic_competence_scores
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'directeur'::public.app_role));

CREATE POLICY "Admins can manage all competence scores"
ON public.shared_diagnostic_competence_scores
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.score_shared_diagnostic_competences(_diagnostic_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_access BOOLEAN;
  result JSONB;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.shared_diagnostics sd
    WHERE sd.id = _diagnostic_id
      AND (
        sd.formateur_id = auth.uid()
        OR sd.learner_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'directeur'::public.app_role)
      )
  ) INTO can_access;

  IF NOT can_access THEN
    RAISE EXCEPTION 'Access denied for this diagnostic';
  END IF;

  DELETE FROM public.shared_diagnostic_competence_scores
  WHERE diagnostic_id = _diagnostic_id;

  WITH rules AS (
    SELECT * FROM (VALUES
      ('organisation', 'Organisation', 'Transversal', ARRAY['organiser','organisation','planning','préparer','preparer','ranger','gérer','gerer','budget','documents','administratif','courses','repas','rendez-vous','horaire']),
      ('communication', 'Communication', 'Relationnel', ARRAY['client','accueil','expliquer','traduire','telephone','téléphone','parler','écouter','ecouter','négocier','negocier','informer','conseiller','vente']),
      ('travail_equipe', 'Travail en équipe', 'Relationnel', ARRAY['équipe','equipe','collègue','collegue','association','famille','entraide','aider ensemble','coopérer','cooperer','partager','groupe']),
      ('autonomie', 'Autonomie', 'Transversal', ARRAY['seul','seule','autonome','responsable','initiative','démarche','demarche','déplacement','deplacement','résoudre','resoudre','chercher','débrouiller','debrouiller']),
      ('gestion_stress', 'Gestion des imprévus', 'Transversal', ARRAY['urgence','problème','probleme','conflit','pression','stress','malade','retard','imprévu','imprevu','solution','calmer','priorité','priorite']),
      ('relation_aide', 'Aide et accompagnement', 'Service aux personnes', ARRAY['aider','accompagner','soigner','garder','enfant','enfants','personne âgée','personnes âgées','malade','handicap','écouter','ecouter','soutenir']),
      ('technique_metier', 'Gestes techniques métier', 'Métier', ARRAY['cuisine','cuisiner','ménage','menage','nettoyage','bâtiment','batiment','chantier','couture','mécanique','mecanique','agriculture','réparer','reparer','machine','outil','conduire']),
      ('commerce_service', 'Commerce et service client', 'Service client', ARRAY['vendre','vente','marché','marche','caisse','prix','client','commande','stock','négocier','negocier','boutique','restaurant','service']),
      ('fiabilite', 'Fiabilité', 'Comportement professionnel', ARRAY['ponctuel','ponctuelle','régulier','regulier','confiance','responsable','sérieux','serieux','présent','present','respecter','engagement','sécurité','securite']),
      ('apprentissage', 'Capacité d’apprentissage', 'Apprendre à apprendre', ARRAY['apprendre','formation','école','ecole','cours','langue','diplôme','diplome','certificat','lire','écrire','ecrire','progresser'])
    ) AS r(competence_key, competence_label, domain, keywords)
  ), experience_text AS (
    SELECT
      e.id,
      e.category,
      lower(coalesce(e.description, '') || ' ' || array_to_string(coalesce(e.activities, '{}'), ' ')) AS content
    FROM public.shared_diagnostic_experiences e
    WHERE e.diagnostic_id = _diagnostic_id
  ), match_rows AS (
    SELECT
      r.competence_key,
      r.competence_label,
      r.domain,
      e.id AS experience_id,
      e.category,
      kw AS keyword
    FROM rules r
    CROSS JOIN LATERAL unnest(r.keywords) AS kw
    JOIN experience_text e ON e.content LIKE '%' || lower(kw) || '%'
  ), scored AS (
    SELECT
      competence_key,
      competence_label,
      domain,
      LEAST(100, (COUNT(DISTINCT keyword)::int * 18) + (COUNT(DISTINCT category)::int * 7) + (COUNT(DISTINCT experience_id)::int * 5)) AS score,
      ARRAY_AGG(DISTINCT category) AS detected_from,
      jsonb_agg(DISTINCT jsonb_build_object('categorie', category, 'mot_cle', keyword)) AS evidence
    FROM match_rows
    GROUP BY competence_key, competence_label, domain
    HAVING COUNT(DISTINCT keyword) > 0
  ), inserted AS (
    INSERT INTO public.shared_diagnostic_competence_scores (
      diagnostic_id,
      competence_key,
      competence_label,
      domain,
      score,
      level,
      detected_from,
      evidence
    )
    SELECT
      _diagnostic_id,
      competence_key,
      competence_label,
      domain,
      score,
      CASE
        WHEN score >= 75 THEN 'maîtrise'
        WHEN score >= 45 THEN 'opérationnel'
        WHEN score >= 20 THEN 'émergent'
        ELSE 'repéré'
      END,
      detected_from,
      evidence
    FROM scored
    RETURNING competence_key, competence_label, domain, score, level, detected_from, evidence
  )
  SELECT coalesce(jsonb_agg(to_jsonb(inserted) ORDER BY score DESC), '[]'::jsonb)
  INTO result
  FROM inserted;

  UPDATE public.shared_diagnostic_experiences e
  SET detected_competences = coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'competence_key', s.competence_key,
      'competence_label', s.competence_label,
      'score', s.score,
      'level', s.level
    ) ORDER BY s.score DESC)
    FROM public.shared_diagnostic_competence_scores s
    WHERE s.diagnostic_id = _diagnostic_id
      AND e.category = ANY(s.detected_from)
  ), '[]'::jsonb)
  WHERE e.diagnostic_id = _diagnostic_id;

  RETURN result;
END;
$$;