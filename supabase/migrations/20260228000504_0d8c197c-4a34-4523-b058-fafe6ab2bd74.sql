-- Fix: recreate view with SECURITY INVOKER to respect RLS
DROP VIEW IF EXISTS public.training_providers_public;
CREATE VIEW public.training_providers_public WITH (security_invoker = true) AS
  SELECT id, name, description, logo_url, website, city, postal_code, address,
         latitude, longitude, is_active, provider_type, created_at, updated_at
  FROM public.training_providers
  WHERE is_active = true;