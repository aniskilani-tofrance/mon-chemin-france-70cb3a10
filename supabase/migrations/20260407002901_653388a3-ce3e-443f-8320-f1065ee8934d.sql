-- Add user_id column to test_results for linking placement tests to user profiles
ALTER TABLE public.test_results ADD COLUMN user_id uuid;

-- Create index for efficient lookup
CREATE INDEX idx_test_results_user_id ON public.test_results (user_id) WHERE user_id IS NOT NULL;

-- RLS policy: users can view their own test results
CREATE POLICY "Users can view their own test results"
ON public.test_results
FOR SELECT
TO authenticated
USING (user_id = auth.uid());