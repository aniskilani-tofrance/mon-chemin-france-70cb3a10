
-- 1. Trigger to prevent direct updates to purchased_at on leads table
CREATE OR REPLACE FUNCTION public.protect_purchased_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service role (edge functions) to update purchased_at
  -- Block regular authenticated users from changing it directly
  IF NEW.purchased_at IS DISTINCT FROM OLD.purchased_at THEN
    -- Check if the caller is an admin (admins can do anything)
    IF public.has_role(auth.uid(), 'admin') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'purchased_at cannot be modified directly. Use the payment flow.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_purchased_at_trigger
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_purchased_at();

-- 2. Replace the overly permissive consents INSERT policy with email validation
DROP POLICY IF EXISTS "Anyone can insert consents" ON public.consents;
CREATE POLICY "Anyone can insert consents with valid email"
  ON public.consents
  FOR INSERT
  TO public
  WITH CHECK (
    email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 255
  );
