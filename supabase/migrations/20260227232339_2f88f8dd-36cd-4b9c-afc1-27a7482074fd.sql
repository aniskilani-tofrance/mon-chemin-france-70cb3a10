CREATE OR REPLACE FUNCTION public.get_lead_price_scored(cert_type certification_type, score integer)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $$
    SELECT CASE 
        WHEN cert_type = 'language' THEN
            CASE WHEN score >= 80 THEN 45.00 WHEN score >= 50 THEN 30.00 ELSE 20.00 END
        WHEN cert_type = 'cqp' THEN
            CASE WHEN score >= 80 THEN 280.00 WHEN score >= 50 THEN 200.00 ELSE 140.00 END
        WHEN cert_type = 'tp' THEN
            CASE WHEN score >= 80 THEN 400.00 WHEN score >= 50 THEN 300.00 ELSE 200.00 END
        ELSE
            CASE WHEN score >= 80 THEN 45.00 WHEN score >= 50 THEN 30.00 ELSE 20.00 END
    END;
$$;

CREATE OR REPLACE FUNCTION public.get_lead_price(cert_type certification_type)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $$
    SELECT CASE cert_type
        WHEN 'language' THEN 30.00
        WHEN 'cqp'      THEN 200.00
        WHEN 'tp'        THEN 300.00
        ELSE 30.00
    END;
$$;