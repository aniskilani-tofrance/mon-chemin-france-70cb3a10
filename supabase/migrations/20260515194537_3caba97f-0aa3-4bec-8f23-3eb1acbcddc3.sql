-- 1) Tighten anonymous + authenticated insert on onboarding_results
DROP POLICY IF EXISTS "Anon can insert onboarding results" ON public.onboarding_results;
DROP POLICY IF EXISTS "Authenticated can insert onboarding results" ON public.onboarding_results;

CREATE POLICY "Anon can submit orientation diagnostic"
ON public.onboarding_results
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND assigned_advisor_id IS NULL
  AND advisor_notes IS NULL
  AND callback_done_at IS NULL
  AND follow_up_status = 'nouveau_diagnostic'::public.follow_up_status
  AND language IS NOT NULL
  AND length(language) BETWEEN 2 AND 8
  AND answers IS NOT NULL
  AND jsonb_typeof(answers) = 'object'
  AND (email IS NULL OR (length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'))
  AND (phone IS NULL OR length(phone) <= 40)
  AND (first_name IS NULL OR length(first_name) <= 120)
);

CREATE POLICY "Authenticated can submit orientation diagnostic"
ON public.onboarding_results
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
  AND assigned_advisor_id IS NULL
  AND advisor_notes IS NULL
  AND callback_done_at IS NULL
  AND follow_up_status = 'nouveau_diagnostic'::public.follow_up_status
  AND language IS NOT NULL
  AND length(language) BETWEEN 2 AND 8
  AND answers IS NOT NULL
  AND jsonb_typeof(answers) = 'object'
  AND (email IS NULL OR (length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'))
  AND (phone IS NULL OR length(phone) <= 40)
  AND (first_name IS NULL OR length(first_name) <= 120)
);

-- 2) Provider-logos public bucket: prevent listing while keeping known-URL access
DROP POLICY IF EXISTS "Public read provider-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can list provider-logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view provider logos" ON storage.objects;
DROP POLICY IF EXISTS "Provider logos are publicly accessible" ON storage.objects;

-- Allow direct object reads only when caller knows the exact filename (no listing).
CREATE POLICY "Provider logos read by exact name"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'provider-logos'
  AND name = (current_setting('request.object.name', true))::text
);

-- Authenticated providers/admins can manage their own logos (writes).
CREATE POLICY "Authenticated can upload provider logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider-logos');

CREATE POLICY "Authenticated can update provider logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'provider-logos')
WITH CHECK (bucket_id = 'provider-logos');

CREATE POLICY "Admins can delete provider logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'provider-logos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
