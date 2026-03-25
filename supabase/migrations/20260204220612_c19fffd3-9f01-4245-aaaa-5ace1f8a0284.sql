-- Add new lead_status values to the enum
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'a_qualifier';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'qualifie_fle';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'qualifie_of';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'qualifie_employeur';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'sas_insertion';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'transmis_partenaire';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'rdv_fixe';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'entre_formation';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'recrute';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'perdu_injoignable';

-- Add new columns to profiles table for enhanced onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS literacy VARCHAR(20),
ADD COLUMN IF NOT EXISTS french_level_cecrl VARCHAR(10),
ADD COLUMN IF NOT EXISTS work_right VARCHAR(20),
ADD COLUMN IF NOT EXISTS barriers TEXT[],
ADD COLUMN IF NOT EXISTS main_goal VARCHAR(30),
ADD COLUMN IF NOT EXISTS contact_48h BOOLEAN,
ADD COLUMN IF NOT EXISTS lead_route VARCHAR(20),
ADD COLUMN IF NOT EXISTS lead_score INTEGER,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS fle_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS fle_format VARCHAR(20),
ADD COLUMN IF NOT EXISTS training_duration VARCHAR(20),
ADD COLUMN IF NOT EXISTS mobility VARCHAR(20),
ADD COLUMN IF NOT EXISTS funding_status VARCHAR(30),
ADD COLUMN IF NOT EXISTS work_schedule VARCHAR(20),
ADD COLUMN IF NOT EXISTS mobility_km VARCHAR(20),
ADD COLUMN IF NOT EXISTS immediate_availability BOOLEAN;

-- Add constraints for new columns
ALTER TABLE public.profiles
ADD CONSTRAINT check_literacy CHECK (literacy IS NULL OR literacy IN ('yes', 'partial', 'no')),
ADD CONSTRAINT check_french_level_cecrl CHECK (french_level_cecrl IS NULL OR french_level_cecrl IN ('alpha', 'a1', 'a2', 'b1')),
ADD CONSTRAINT check_work_right CHECK (work_right IS NULL OR work_right IN ('yes', 'no', 'unknown')),
ADD CONSTRAINT check_main_goal CHECK (main_goal IS NULL OR main_goal IN ('learn_french', 'find_job', 'job_training', 'need_help')),
ADD CONSTRAINT check_lead_route CHECK (lead_route IS NULL OR lead_route IN ('route_a', 'route_b', 'route_c', 'sas')),
ADD CONSTRAINT check_lead_score CHECK (lead_score IS NULL OR (lead_score >= 0 AND lead_score <= 100));

-- Create index for lead_route for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_lead_route ON public.profiles(lead_route);
CREATE INDEX IF NOT EXISTS idx_profiles_lead_score ON public.profiles(lead_score);