ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text;

-- Backfill from latest onboarding_checkpoint when available
UPDATE public.profiles p
SET preferred_language = c.language
FROM public.onboarding_checkpoints c
WHERE p.user_id = c.user_id
  AND p.preferred_language IS NULL
  AND c.language IS NOT NULL;
