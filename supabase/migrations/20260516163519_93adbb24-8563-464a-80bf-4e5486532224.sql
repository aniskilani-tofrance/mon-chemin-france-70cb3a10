ALTER TABLE public.training_providers
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_training_providers_tags
  ON public.training_providers USING GIN (tags);