-- Allow providers to view profiles of their leads
CREATE POLICY "Providers can view profiles of their leads"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT l.profile_id FROM public.leads l
    JOIN public.training_providers tp ON tp.id = l.provider_id
    WHERE tp.user_id = auth.uid()
  )
);