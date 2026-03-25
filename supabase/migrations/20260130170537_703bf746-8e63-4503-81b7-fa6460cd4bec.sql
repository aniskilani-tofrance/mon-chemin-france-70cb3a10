-- Create enum for training types
CREATE TYPE public.training_type AS ENUM ('language', 'professional', 'both');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('pending', 'contacted', 'converted', 'rejected');

-- Create profiles table for onboarding data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    origin_country TEXT,
    previous_job TEXT,
    skills TEXT[],
    target_sector TEXT,
    french_level INTEGER CHECK (french_level BETWEEN 1 AND 5),
    city TEXT,
    postal_code TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Create training providers table (the pros who pay for leads)
CREATE TABLE public.training_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    lead_price DECIMAL(10,2) DEFAULT 15.00, -- Price per lead in EUR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create trainings table (courses offered by providers)
CREATE TABLE public.trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.training_providers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    training_type training_type NOT NULL,
    target_sectors TEXT[], -- Sectors this training prepares for
    min_french_level INTEGER CHECK (min_french_level BETWEEN 1 AND 5),
    duration_weeks INTEGER,
    is_remote BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create leads table (the monetization - profile matched with training)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    training_id UUID REFERENCES public.trainings(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.training_providers(id) ON DELETE SET NULL NOT NULL,
    status lead_status DEFAULT 'pending' NOT NULL,
    match_score INTEGER CHECK (match_score BETWEEN 0 AND 100), -- Relevance score
    price_charged DECIMAL(10,2), -- Actual price charged for this lead
    notes TEXT,
    contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Profiles: users can manage their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Training providers: public read for active providers
CREATE POLICY "Anyone can view active training providers"
ON public.training_providers FOR SELECT
USING (is_active = true);

-- Trainings: public read for active trainings
CREATE POLICY "Anyone can view active trainings"
ON public.trainings FOR SELECT
USING (is_active = true);

-- Leads: users can view leads for their profile
CREATE POLICY "Users can view their own leads"
ON public.leads FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_trainings_provider_id ON public.trainings(provider_id);
CREATE INDEX idx_trainings_type ON public.trainings(training_type);
CREATE INDEX idx_leads_profile_id ON public.leads(profile_id);
CREATE INDEX idx_leads_provider_id ON public.leads(provider_id);
CREATE INDEX idx_leads_status ON public.leads(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_providers_updated_at
BEFORE UPDATE ON public.training_providers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at
BEFORE UPDATE ON public.trainings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();