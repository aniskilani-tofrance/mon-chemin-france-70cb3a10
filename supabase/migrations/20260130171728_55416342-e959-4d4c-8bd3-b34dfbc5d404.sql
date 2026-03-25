-- Create a public view that excludes sensitive contact information
CREATE VIEW public.training_providers_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    name,
    description,
    logo_url,
    website,
    city,
    postal_code,
    address,
    latitude,
    longitude,
    is_active,
    created_at,
    updated_at
  FROM public.training_providers
  WHERE is_active = true;
-- Note: email, phone, and lead_price are excluded from this view

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can view active training providers" ON public.training_providers;

-- Create a restrictive policy: only authenticated users can access the full table
CREATE POLICY "Authenticated users can view active training providers"
ON public.training_providers
FOR SELECT
TO authenticated
USING (is_active = true);