-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert consents" ON public.consents;
DROP POLICY IF EXISTS "Users can view their consents by email" ON public.consents;
DROP POLICY IF EXISTS "Users can update their consents" ON public.consents;

-- Keep INSERT permissive for unauthenticated onboarding flow (GDPR requirement)
CREATE POLICY "Anyone can insert consents"
ON public.consents
FOR INSERT
WITH CHECK (true);

-- Restrict SELECT to authenticated users viewing only their own consents
CREATE POLICY "Authenticated users can view their own consents"
ON public.consents
FOR SELECT
TO authenticated
USING (email = auth.jwt()->>'email');

-- Restrict UPDATE to authenticated users modifying only their own consents
CREATE POLICY "Authenticated users can update their own consents"
ON public.consents
FOR UPDATE
TO authenticated
USING (email = auth.jwt()->>'email');