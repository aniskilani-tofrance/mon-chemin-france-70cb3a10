
DO $$ BEGIN
  CREATE TYPE public.recommended_path AS ENUM ('francais','emploi','formation','diplome','social','numerique');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.follow_up_status AS ENUM (
    'nouveau_diagnostic','a_rappeler','contacte','besoin_confirme','oriente',
    'rdv_propose','inscrit','en_formation','en_accompagnement','en_emploi',
    'a_relancer','frein_identifie','sortie_positive','dossier_cloture'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.onboarding_results
  ADD COLUMN IF NOT EXISTS recommended_path public.recommended_path,
  ADD COLUMN IF NOT EXISTS secondary_path public.recommended_path,
  ADD COLUMN IF NOT EXISTS follow_up_status public.follow_up_status NOT NULL DEFAULT 'nouveau_diagnostic',
  ADD COLUMN IF NOT EXISTS callback_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS callback_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS callback_done_at timestamptz,
  ADD COLUMN IF NOT EXISTS assigned_advisor_id uuid,
  ADD COLUMN IF NOT EXISTS advisor_notes text;

DROP POLICY IF EXISTS "Conseillers can view onboarding results" ON public.onboarding_results;
CREATE POLICY "Conseillers can view onboarding results"
ON public.onboarding_results FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'conseiller'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Conseillers can update follow-up" ON public.onboarding_results;
CREATE POLICY "Conseillers can update follow-up"
ON public.onboarding_results FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'conseiller'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'conseiller'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_onboarding_results_follow_up_status
  ON public.onboarding_results(follow_up_status);
CREATE INDEX IF NOT EXISTS idx_onboarding_results_callback_requested_at
  ON public.onboarding_results(callback_requested_at);
