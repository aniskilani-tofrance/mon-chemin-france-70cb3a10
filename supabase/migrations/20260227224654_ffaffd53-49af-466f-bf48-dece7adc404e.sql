
-- Training sessions table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  max_seats INTEGER,
  enrolled INTEGER DEFAULT 0,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Providers can view sessions of their trainings
CREATE POLICY "Providers can view their training sessions"
ON public.training_sessions FOR SELECT
USING (training_id IN (
  SELECT t.id FROM trainings t
  JOIN training_providers tp ON tp.id = t.provider_id
  WHERE tp.user_id = auth.uid()
));

-- Providers can insert sessions for their trainings
CREATE POLICY "Providers can insert their training sessions"
ON public.training_sessions FOR INSERT
WITH CHECK (training_id IN (
  SELECT t.id FROM trainings t
  JOIN training_providers tp ON tp.id = t.provider_id
  WHERE tp.user_id = auth.uid()
));

-- Providers can update sessions of their trainings
CREATE POLICY "Providers can update their training sessions"
ON public.training_sessions FOR UPDATE
USING (training_id IN (
  SELECT t.id FROM trainings t
  JOIN training_providers tp ON tp.id = t.provider_id
  WHERE tp.user_id = auth.uid()
));

-- Providers can delete sessions of their trainings
CREATE POLICY "Providers can delete their training sessions"
ON public.training_sessions FOR DELETE
USING (training_id IN (
  SELECT t.id FROM trainings t
  JOIN training_providers tp ON tp.id = t.provider_id
  WHERE tp.user_id = auth.uid()
));

-- Public can view sessions of active trainings
CREATE POLICY "Anyone can view sessions of active trainings"
ON public.training_sessions FOR SELECT
USING (training_id IN (
  SELECT id FROM trainings WHERE is_active = true
));

-- Trigger for updated_at
CREATE TRIGGER update_training_sessions_updated_at
BEFORE UPDATE ON public.training_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Logo storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-logos', 'provider-logos', true);

CREATE POLICY "Anyone can view provider logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-logos');

CREATE POLICY "Providers can upload their logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'provider-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Providers can update their logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'provider-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Providers can delete their logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'provider-logos' AND auth.uid() IS NOT NULL);
