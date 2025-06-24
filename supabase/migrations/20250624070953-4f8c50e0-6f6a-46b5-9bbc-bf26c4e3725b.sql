
-- Add currency and estimated_value columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS estimated_revenue DECIMAL(12,2);

-- Update the estimated_value column to estimated_revenue for consistency
UPDATE public.leads 
SET estimated_revenue = estimated_value 
WHERE estimated_value IS NOT NULL;

-- Remove the old estimated_value column
ALTER TABLE public.leads 
DROP COLUMN IF EXISTS estimated_value;

-- Create index for better performance on currency queries
CREATE INDEX IF NOT EXISTS idx_leads_currency ON public.leads(currency);
CREATE INDEX IF NOT EXISTS idx_leads_estimated_revenue ON public.leads(estimated_revenue);

-- Update conversions table to include currency for consistency
ALTER TABLE public.conversions 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Create index for conversions currency
CREATE INDEX IF NOT EXISTS idx_conversions_currency ON public.conversions(currency);
