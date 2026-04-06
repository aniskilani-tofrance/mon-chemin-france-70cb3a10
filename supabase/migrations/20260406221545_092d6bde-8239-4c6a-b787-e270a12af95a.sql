
-- 1. Remove old broad storage policies that only check auth.uid() IS NOT NULL
DROP POLICY IF EXISTS "Providers can delete their logo" ON storage.objects;
DROP POLICY IF EXISTS "Providers can update their logo" ON storage.objects;

-- 2. Restrict fle_exercises SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view exercises" ON public.fle_exercises;

CREATE POLICY "Authenticated users can view exercises"
ON public.fle_exercises FOR SELECT
TO authenticated
USING (true);
