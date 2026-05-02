-- Statut administratif fin pour orientation vers dispositifs publics
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_status_detailed text,
  ADD COLUMN IF NOT EXISTS cir_signed boolean,
  ADD COLUMN IF NOT EXISTS cir_signed_at date,
  ADD COLUMN IF NOT EXISTS ofii_hours_remaining integer,
  ADD COLUMN IF NOT EXISTS housing_blocking boolean,
  ADD COLUMN IF NOT EXISTS prefers_female_trainer boolean,
  ADD COLUMN IF NOT EXISTS childcare_status text,
  ADD COLUMN IF NOT EXISTS needs_diploma_recognition boolean;

COMMENT ON COLUMN public.profiles.admin_status_detailed IS 'Statut administratif détaillé : cir_in_progress | cir_signed | bpi_refugie | bpi_subsidiaire | demandeur_asile | titre_sejour | sans_papiers | ue | autre';
COMMENT ON COLUMN public.profiles.ofii_hours_remaining IS 'Heures OFII de français gratuites restantes (sur le quota 100/200/400/600h selon profil)';
COMMENT ON COLUMN public.profiles.housing_blocking IS 'TRUE si la personne n''a pas de domiciliation administrative (bloquant pour France Travail / CAF)';
COMMENT ON COLUMN public.profiles.childcare_status IS 'Mode de garde : none | informal | creche | school | not_needed';