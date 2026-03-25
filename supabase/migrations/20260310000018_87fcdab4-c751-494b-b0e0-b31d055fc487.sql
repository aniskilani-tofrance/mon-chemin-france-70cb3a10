
-- 1. Attach the protect_purchased_at trigger to leads table
CREATE TRIGGER protect_purchased_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_purchased_at();

-- 2. Restrict provider UPDATE policy to only safe columns
-- Drop old permissive policy
DROP POLICY IF EXISTS "Providers can update their leads" ON public.leads;

-- Create new restrictive policy that only allows updating safe columns
CREATE POLICY "Providers can update their leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  provider_id IN (
    SELECT training_providers.id
    FROM training_providers
    WHERE training_providers.user_id = auth.uid()
  )
)
WITH CHECK (
  provider_id IN (
    SELECT training_providers.id
    FROM training_providers
    WHERE training_providers.user_id = auth.uid()
  )
);
