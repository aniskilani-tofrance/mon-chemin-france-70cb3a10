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