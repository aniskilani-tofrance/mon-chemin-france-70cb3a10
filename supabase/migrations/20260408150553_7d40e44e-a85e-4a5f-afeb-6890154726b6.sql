
-- Table for saving partial onboarding progress at the signup checkpoint
CREATE TABLE public.onboarding_checkpoints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NULL,
  email text NULL,
  language text NOT NULL DEFAULT 'fr',
  partial_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step text NOT NULL DEFAULT 'location',
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone NULL,
  reminder_1h_sent boolean NOT NULL DEFAULT false,
  reminder_24h_sent boolean NOT NULL DEFAULT false,
  reminder_72h_sent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_checkpoints ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own checkpoints
CREATE POLICY "Users can view own checkpoints"
  ON public.onboarding_checkpoints
  FOR SELECT
  USING (user_id = auth.uid());

-- Authenticated users can update their own checkpoints
CREATE POLICY "Users can update own checkpoints"
  ON public.onboarding_checkpoints
  FOR UPDATE
  USING (user_id = auth.uid());

-- Authenticated users can insert checkpoints for themselves
CREATE POLICY "Users can insert own checkpoints"
  ON public.onboarding_checkpoints
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all checkpoints
CREATE POLICY "Admins can view all checkpoints"
  ON public.onboarding_checkpoints
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all checkpoints (for cron/edge function updates)
CREATE POLICY "Admins can manage all checkpoints"
  ON public.onboarding_checkpoints
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_onboarding_checkpoints_updated_at
  BEFORE UPDATE ON public.onboarding_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
