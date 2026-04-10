
CREATE POLICY "Directeurs can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'directeur'));

CREATE POLICY "Directeurs can view all onboarding results"
ON public.onboarding_results FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'directeur'));
