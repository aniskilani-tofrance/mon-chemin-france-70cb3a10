-- Allow providers to insert trainings for their own provider record
CREATE POLICY "Providers can insert their own trainings"
ON public.trainings
FOR INSERT
WITH CHECK (
  provider_id IN (
    SELECT id FROM public.training_providers WHERE user_id = auth.uid()
  )
);

-- Allow providers to update their own trainings
CREATE POLICY "Providers can update their own trainings"
ON public.trainings
FOR UPDATE
USING (
  provider_id IN (
    SELECT id FROM public.training_providers WHERE user_id = auth.uid()
  )
);

-- Allow providers to delete their own trainings
CREATE POLICY "Providers can delete their own trainings"
ON public.trainings
FOR DELETE
USING (
  provider_id IN (
    SELECT id FROM public.training_providers WHERE user_id = auth.uid()
  )
);