-- Allow admins to insert training_providers
CREATE POLICY "Admins can insert training providers"
ON public.training_providers
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all training providers
CREATE POLICY "Admins can update all training providers"
ON public.training_providers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to select all training providers (including inactive)
CREATE POLICY "Admins can view all training providers"
ON public.training_providers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete training providers
CREATE POLICY "Admins can delete training providers"
ON public.training_providers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));