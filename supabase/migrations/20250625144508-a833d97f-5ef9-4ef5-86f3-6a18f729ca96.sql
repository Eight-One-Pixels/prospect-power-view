
-- Add currency field to goals table for revenue goals
ALTER TABLE public.goals ADD COLUMN currency text DEFAULT 'USD';

-- Create function to update conversion goals when a new conversion is added
CREATE OR REPLACE FUNCTION public.update_conversion_goals()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update conversion goals count
  UPDATE public.goals 
  SET current_value = (
    SELECT COUNT(*)::DECIMAL
    FROM public.conversions 
    WHERE rep_id = NEW.rep_id 
    AND conversion_date BETWEEN goals.period_start AND goals.period_end
  ),
  updated_at = now()
  WHERE user_id = NEW.rep_id 
  AND goal_type = 'conversions'
  AND period_start <= NEW.conversion_date 
  AND period_end >= NEW.conversion_date;

  -- Update revenue goals (sum of revenue in goal's currency)
  UPDATE public.goals 
  SET current_value = (
    SELECT COALESCE(SUM(revenue_amount), 0)::DECIMAL
    FROM public.conversions 
    WHERE rep_id = NEW.rep_id 
    AND conversion_date BETWEEN goals.period_start AND goals.period_end
    AND (currency = goals.currency OR (currency IS NULL AND goals.currency = 'USD'))
  ),
  updated_at = now()
  WHERE user_id = NEW.rep_id 
  AND goal_type = 'revenue'
  AND period_start <= NEW.conversion_date 
  AND period_end >= NEW.conversion_date;

  RETURN NEW;
END;
$function$;

-- Create trigger for conversion goals
CREATE TRIGGER update_conversion_goals_trigger
  AFTER INSERT OR UPDATE ON public.conversions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversion_goals();

-- Create function to update lead goals when a new lead is added
CREATE OR REPLACE FUNCTION public.update_lead_goals()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update lead goals count
  UPDATE public.goals 
  SET current_value = (
    SELECT COUNT(*)::DECIMAL
    FROM public.leads 
    WHERE created_by = NEW.created_by 
    AND created_at::date BETWEEN goals.period_start AND goals.period_end
  ),
  updated_at = now()
  WHERE user_id = NEW.created_by 
  AND goal_type = 'leads'
  AND period_start <= NEW.created_at::date 
  AND period_end >= NEW.created_at::date;

  RETURN NEW;
END;
$function$;

-- Create trigger for lead goals
CREATE TRIGGER update_lead_goals_trigger
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_goals();
