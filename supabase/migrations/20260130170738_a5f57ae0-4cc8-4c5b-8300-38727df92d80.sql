-- Create enum for certification types with different lead prices
CREATE TYPE public.certification_type AS ENUM ('language', 'cqp', 'tp');

-- Add certification_type column to trainings
ALTER TABLE public.trainings ADD COLUMN certification_type certification_type DEFAULT 'language';

-- Update lead_price column comment and add a function to get price by certification
CREATE OR REPLACE FUNCTION public.get_lead_price(cert_type certification_type)
RETURNS DECIMAL(10,2)
LANGUAGE sql
STABLE
AS $$
    SELECT CASE cert_type
        WHEN 'language' THEN 30.00
        WHEN 'cqp' THEN 100.00
        WHEN 'tp' THEN 500.00
        ELSE 30.00
    END;
$$;

-- Remove default lead_price from training_providers (price is now per training type)
ALTER TABLE public.training_providers ALTER COLUMN lead_price DROP DEFAULT;

-- Add trigger to auto-set lead price when creating a lead
CREATE OR REPLACE FUNCTION public.set_lead_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.training_id IS NOT NULL AND NEW.price_charged IS NULL THEN
        SELECT public.get_lead_price(t.certification_type)
        INTO NEW.price_charged
        FROM public.trainings t
        WHERE t.id = NEW.training_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER auto_set_lead_price
BEFORE INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.set_lead_price();