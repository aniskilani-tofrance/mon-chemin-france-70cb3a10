
-- Add user_id to training_providers to link provider accounts
ALTER TABLE public.training_providers
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create unique index so one user = one provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_training_providers_user_id ON public.training_providers(user_id);

-- Allow providers to view their own provider record
CREATE POLICY "Providers can view own record"
ON public.training_providers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow providers to update their own provider record
CREATE POLICY "Providers can update own record"
ON public.training_providers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Allow providers to view their own leads
CREATE POLICY "Providers can view their leads"
ON public.leads
FOR SELECT
TO authenticated
USING (provider_id IN (
  SELECT id FROM public.training_providers WHERE user_id = auth.uid()
));

-- Allow providers to update their own leads (status, notes, contacted_at, converted_at)
CREATE POLICY "Providers can update their leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (provider_id IN (
  SELECT id FROM public.training_providers WHERE user_id = auth.uid()
));
