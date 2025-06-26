
-- 1. Create clients table for repeat business handling
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    industry TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add lead_date field to leads table
ALTER TABLE public.leads 
ADD COLUMN lead_date DATE DEFAULT CURRENT_DATE;

-- 3. Create customizable status and source options tables
CREATE TABLE public.lead_status_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, value)
);

CREATE TABLE public.lead_source_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, value)
);

-- 4. Create deductions table for tax/levy configuration
CREATE TABLE public.deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    label TEXT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    applies_before_commission BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Add commissionable_amount to conversions table
ALTER TABLE public.conversions 
ADD COLUMN commissionable_amount DECIMAL(10,2),
ADD COLUMN deductions_applied JSONB DEFAULT '[]'::jsonb;

-- Enable RLS on new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_status_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_source_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deductions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Managers can view all clients" ON public.clients
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for lead status options
CREATE POLICY "Users can manage their own status options" ON public.lead_status_options
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all status options" ON public.lead_status_options
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for lead source options
CREATE POLICY "Users can manage their own source options" ON public.lead_source_options
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all source options" ON public.lead_source_options
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for deductions (Admin/Director only)
CREATE POLICY "Admins and Directors can manage deductions" ON public.deductions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'director')
        )
    );

CREATE POLICY "All users can view active deductions" ON public.deductions
    FOR SELECT USING (is_active = true);

-- Insert default status options
INSERT INTO public.lead_status_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'New', 'new', true FROM public.user_roles ur;

INSERT INTO public.lead_status_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Contacted', 'contacted', true FROM public.user_roles ur;

INSERT INTO public.lead_status_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Qualified', 'qualified', true FROM public.user_roles ur;

INSERT INTO public.lead_status_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Proposal Sent', 'proposal', true FROM public.user_roles ur;

INSERT INTO public.lead_status_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Negotiation', 'negotiation', true FROM public.user_roles ur;

INSERT INTO public.lead_status_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Closed Won', 'closed_won', true FROM public.user_roles ur;

INSERT INTO public.lead_status_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Closed Lost', 'closed_lost', true FROM public.user_roles ur;

-- Insert default source options
INSERT INTO public.lead_source_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Referral', 'referral', true FROM public.user_roles ur;

INSERT INTO public.lead_source_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Website', 'website', true FROM public.user_roles ur;

INSERT INTO public.lead_source_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Social Media', 'social_media', true FROM public.user_roles ur;

INSERT INTO public.lead_source_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Cold Call', 'cold_call', true FROM public.user_roles ur;

INSERT INTO public.lead_source_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Event', 'event', true FROM public.user_roles ur;

INSERT INTO public.lead_source_options (user_id, label, value, is_default) 
SELECT ur.user_id, 'Other', 'other', true FROM public.user_roles ur;

-- Create function to calculate commission with deductions
CREATE OR REPLACE FUNCTION public.calculate_commission_with_deductions(
    revenue_amount DECIMAL,
    commission_rate DECIMAL,
    currency TEXT DEFAULT 'USD'
)
RETURNS TABLE (
    commissionable_amount DECIMAL,
    total_deductions DECIMAL,
    final_commission DECIMAL,
    deductions_applied JSONB
) 
LANGUAGE plpgsql
AS $$
DECLARE
    deduction RECORD;
    total_deduction_amount DECIMAL := 0;
    deductions_array JSONB := '[]'::jsonb;
    working_amount DECIMAL := revenue_amount;
BEGIN
    -- Get all active deductions
    FOR deduction IN 
        SELECT d.id, d.label, d.percentage, d.applies_before_commission
        FROM public.deductions d 
        WHERE d.is_active = true
        ORDER BY d.applies_before_commission DESC, d.created_at ASC
    LOOP
        DECLARE
            deduction_amount DECIMAL;
        BEGIN
            deduction_amount := working_amount * (deduction.percentage / 100);
            total_deduction_amount := total_deduction_amount + deduction_amount;
            
            -- Add to deductions array
            deductions_array := deductions_array || jsonb_build_object(
                'id', deduction.id,
                'label', deduction.label,
                'percentage', deduction.percentage,
                'amount', deduction_amount,
                'applies_before_commission', deduction.applies_before_commission
            );
            
            -- Update working amount if deduction applies before commission
            IF deduction.applies_before_commission THEN
                working_amount := working_amount - deduction_amount;
            END IF;
        END;
    END LOOP;
    
    RETURN QUERY SELECT 
        working_amount as commissionable_amount,
        total_deduction_amount as total_deductions,
        working_amount * (commission_rate / 100) as final_commission,
        deductions_array as deductions_applied;
END;
$$;
