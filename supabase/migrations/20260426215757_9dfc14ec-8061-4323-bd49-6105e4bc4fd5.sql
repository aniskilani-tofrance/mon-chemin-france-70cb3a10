ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_first_name ON public.leads (first_name);