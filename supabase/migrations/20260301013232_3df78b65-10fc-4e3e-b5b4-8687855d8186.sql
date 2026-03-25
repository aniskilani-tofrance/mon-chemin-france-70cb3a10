
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact requests"
ON public.contact_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view contact requests"
ON public.contact_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
