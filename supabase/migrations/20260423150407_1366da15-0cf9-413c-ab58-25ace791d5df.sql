
-- Tighten "claim" policies: only when no learner is attached yet
DROP POLICY IF EXISTS "Learners can claim placement via code" ON public.placement_test_sessions;

CREATE POLICY "Learners can claim placement via code"
ON public.placement_test_sessions
FOR UPDATE
TO authenticated
USING (learner_id IS NULL AND access_code IS NOT NULL)
WITH CHECK (learner_id = auth.uid() AND access_code IS NOT NULL);
