-- 1) Backfill: link existing onboarding_results to auth users by email
UPDATE public.onboarding_results AS o
SET user_id = u.id
FROM auth.users AS u
WHERE o.user_id IS NULL
  AND o.email IS NOT NULL
  AND lower(o.email) = lower(u.email);

-- 2) Add RLS policy: users can view onboarding_results matching their JWT email
CREATE POLICY "Users can view onboarding results by email"
ON public.onboarding_results
FOR SELECT
TO authenticated
USING (email IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email'));