-- Fix search_path security warning for get_lead_price function
CREATE OR REPLACE FUNCTION public.get_lead_price(cert_type certification_type)
RETURNS DECIMAL(10,2)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT CASE cert_type
        WHEN 'language' THEN 30.00
        WHEN 'cqp' THEN 100.00
        WHEN 'tp' THEN 500.00
        ELSE 30.00
    END;
$$;