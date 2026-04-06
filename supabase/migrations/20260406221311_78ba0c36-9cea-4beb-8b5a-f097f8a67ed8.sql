
-- 1. Fix storage provider-logos DELETE/UPDATE policies
DROP POLICY IF EXISTS "Allow authenticated users to delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update logos" ON storage.objects;

CREATE POLICY "Providers can delete own logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'provider-logos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.training_providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers can update own logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'provider-logos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.training_providers WHERE user_id = auth.uid()
  )
);

-- 2. Fix consents table policies
DROP POLICY IF EXISTS "Anyone can insert consents with valid email" ON public.consents;

CREATE POLICY "Authenticated users can insert own consents"
ON public.consents FOR INSERT
TO authenticated
WITH CHECK (
  email = (auth.jwt() ->> 'email')
  AND email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
);

-- Allow anon insert only during onboarding (match-leads edge function uses service role)
-- Keep a restricted anon policy for the onboarding flow where user is not yet authenticated
CREATE POLICY "Anon can insert consents with valid email"
ON public.consents FOR INSERT
TO anon
WITH CHECK (
  email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 255
);

-- Add DELETE policy for GDPR compliance
CREATE POLICY "Users can delete their own consents"
ON public.consents FOR DELETE
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

-- Add admin SELECT policy
CREATE POLICY "Admins can view all consents"
ON public.consents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix analytics_events overly permissive INSERT
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(event_type) <= 100
  AND length(session_id) <= 200
);

-- 4. Fix contact_requests overly permissive INSERT
DROP POLICY IF EXISTS "Anyone can insert contact requests" ON public.contact_requests;

CREATE POLICY "Anyone can insert contact requests"
ON public.contact_requests FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) <= 255
  AND length(name) <= 200
  AND length(message) <= 5000
  AND email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
);
