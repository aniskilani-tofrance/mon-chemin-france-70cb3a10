-- CIP: full access to shared diagnostics (same as formateurs but unrestricted scope)
CREATE POLICY "CIP can manage all shared diagnostics"
ON public.shared_diagnostics
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'cip'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'cip'::public.app_role));

CREATE POLICY "CIP can manage shared diagnostic answers"
ON public.shared_diagnostic_answers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'cip'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'cip'::public.app_role));

CREATE POLICY "CIP can manage shared diagnostic experiences"
ON public.shared_diagnostic_experiences
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'cip'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'cip'::public.app_role));

CREATE POLICY "CIP can view shared diagnostic competence scores"
ON public.shared_diagnostic_competence_scores
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'cip'::public.app_role));

-- CIP: read profiles
CREATE POLICY "CIP can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'cip'::public.app_role));

-- Update score function to also let CIP score
CREATE OR REPLACE FUNCTION public.score_shared_diagnostic_competences(_diagnostic_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        OR public.has_role(auth.uid(), 'cip'::public.app_role)
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
      ('apprentissage', 'Capacité d''apprentissage', 'Apprendre à apprendre', ARRAY['apprendre','formation','école','ecole','cours','langue','diplôme','diplome','certificat','lire','écrire','ecrire','progresser'])
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
      diagnostic_id, competence_key, competence_label, domain,
      score, level, detected_from, evidence
    )
    SELECT _diagnostic_id, competence_key, competence_label, domain, score,
      CASE WHEN score >= 75 THEN 'maîtrise'
           WHEN score >= 45 THEN 'opérationnel'
           WHEN score >= 20 THEN 'émergent'
           ELSE 'repéré' END,
      detected_from, evidence
    FROM scored
    RETURNING competence_key, competence_label, domain, score, level, detected_from, evidence
  )
  SELECT coalesce(jsonb_agg(to_jsonb(inserted) ORDER BY score DESC), '[]'::jsonb)
  INTO result FROM inserted;

  RETURN result;
END;
$function$;