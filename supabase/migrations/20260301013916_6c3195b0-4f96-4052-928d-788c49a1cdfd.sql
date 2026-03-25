
-- Admin can view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can insert leads (assign leads to partners)
CREATE POLICY "Admins can insert leads"
ON public.leads FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can update all leads
CREATE POLICY "Admins can update all leads"
ON public.leads FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete leads
CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all profiles (needed to see lead details)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
