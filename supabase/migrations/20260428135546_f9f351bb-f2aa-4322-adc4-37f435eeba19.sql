CREATE POLICY "Provider teams can view their provider profile"
ON public.training_providers
FOR SELECT
TO authenticated
USING (public.can_access_provider(id));