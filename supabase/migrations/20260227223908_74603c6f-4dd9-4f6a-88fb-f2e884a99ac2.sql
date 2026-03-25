-- Update pricing function with score tiers
CREATE OR REPLACE FUNCTION public.get_lead_price(cert_type certification_type)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
    SELECT CASE cert_type
        WHEN 'language' THEN 150.00
        WHEN 'cqp'      THEN 200.00
        WHEN 'tp'        THEN 300.00
        ELSE 150.00
    END;
$function$;

-- New function with score-based tiers
CREATE OR REPLACE FUNCTION public.get_lead_price_scored(cert_type certification_type, score integer)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
    SELECT CASE 
        WHEN cert_type = 'language' THEN
            CASE WHEN score >= 80 THEN 200.00 WHEN score >= 50 THEN 150.00 ELSE 100.00 END
        WHEN cert_type = 'cqp' THEN
            CASE WHEN score >= 80 THEN 280.00 WHEN score >= 50 THEN 200.00 ELSE 140.00 END
        WHEN cert_type = 'tp' THEN
            CASE WHEN score >= 80 THEN 400.00 WHEN score >= 50 THEN 300.00 ELSE 200.00 END
        ELSE
            CASE WHEN score >= 80 THEN 200.00 WHEN score >= 50 THEN 150.00 ELSE 100.00 END
    END;
$function$;

-- Update trigger to use scored pricing
CREATE OR REPLACE FUNCTION public.set_lead_price()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.training_id IS NOT NULL AND NEW.price_charged IS NULL THEN
        SELECT public.get_lead_price_scored(t.certification_type, COALESCE(NEW.match_score, 50))
        INTO NEW.price_charged
        FROM public.trainings t
        WHERE t.id = NEW.training_id;
    END IF;
    RETURN NEW;
END;
$function$;