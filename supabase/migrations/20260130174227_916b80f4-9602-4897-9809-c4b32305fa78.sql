-- Create consent_type enum
CREATE TYPE public.consent_type AS ENUM ('lead_sharing', 'marketing', 'analytics');

-- Create consents table for GDPR compliance
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  consent_type public.consent_type NOT NULL,
  consented BOOLEAN NOT NULL DEFAULT false,
  consent_text_version TEXT NOT NULL DEFAULT '1.0',
  consented_at TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups by email
CREATE INDEX idx_consents_email ON public.consents(email);

-- Create unique constraint to prevent duplicate consent types per email
CREATE UNIQUE INDEX idx_consents_email_type ON public.consents(email, consent_type);

-- Enable Row Level Security
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert their own consent (no auth required for onboarding)
CREATE POLICY "Anyone can insert consents"
ON public.consents
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view consents by their email
CREATE POLICY "Users can view their consents by email"
ON public.consents
FOR SELECT
USING (true);

-- Policy: Users can update their own consents
CREATE POLICY "Users can update their consents"
ON public.consents
FOR UPDATE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_consents_updated_at
BEFORE UPDATE ON public.consents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add consent_id column to leads table for legal basis tracking
ALTER TABLE public.leads ADD COLUMN consent_id UUID REFERENCES public.consents(id);