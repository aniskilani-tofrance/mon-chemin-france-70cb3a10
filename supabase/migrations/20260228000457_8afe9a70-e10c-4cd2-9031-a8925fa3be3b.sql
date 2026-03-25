-- Add provider_type enum
CREATE TYPE public.provider_type AS ENUM ('employer', 'training_org');

-- Add column with default to training_org (existing providers are training orgs)
ALTER TABLE public.training_providers
  ADD COLUMN provider_type public.provider_type NOT NULL DEFAULT 'training_org';

-- Update the employers we inserted earlier
UPDATE public.training_providers
SET provider_type = 'employer'
WHERE name IN ('Geodis Logistique', 'Sodexo France', 'Onet Services', 'Vinci Construction', 'Korian Santé', 'Carrefour France');

-- Expose provider_type in the public view
DROP VIEW IF EXISTS public.training_providers_public;
CREATE VIEW public.training_providers_public AS
  SELECT id, name, description, logo_url, website, city, postal_code, address,
         latitude, longitude, is_active, provider_type, created_at, updated_at
  FROM public.training_providers
  WHERE is_active = true;