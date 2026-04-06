ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS worked_in_france text,
  ADD COLUMN IF NOT EXISTS admin_status text,
  ADD COLUMN IF NOT EXISTS real_comprehension_score text,
  ADD COLUMN IF NOT EXISTS distance_to_job integer;