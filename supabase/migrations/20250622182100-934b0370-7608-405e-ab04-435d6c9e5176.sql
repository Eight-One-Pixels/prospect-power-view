
-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('rep', 'manager', 'director', 'admin');

-- Create leads status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');

-- Create visit types enum
CREATE TYPE public.visit_type AS ENUM ('cold_call', 'follow_up', 'presentation', 'meeting', 'phone_call');

-- Update profiles table to include role and additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS hire_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'rep',
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create leads table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT NOT NULL,
    address TEXT,
    industry TEXT,
    source TEXT NOT NULL,
    status lead_status DEFAULT 'new',
    estimated_value DECIMAL(10,2),
    notes TEXT,
    next_follow_up DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily_visits table
CREATE TABLE public.daily_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rep_id UUID REFERENCES auth.users(id) NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    visit_type visit_type NOT NULL,
    duration_minutes INTEGER,
    outcome TEXT,
    lead_generated BOOLEAN DEFAULT false,
    lead_id UUID REFERENCES public.leads(id),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    goal_type TEXT NOT NULL, -- 'visits', 'leads', 'revenue', 'conversions'
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conversions table (when leads convert to revenue)
CREATE TABLE public.conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) NOT NULL,
    rep_id UUID REFERENCES auth.users(id) NOT NULL,
    conversion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    revenue_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is manager or above
CREATE OR REPLACE FUNCTION public.is_manager_or_above(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('manager', 'director', 'admin')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view team profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        public.is_manager_or_above(auth.uid())
    );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all roles" ON public.user_roles
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for leads
CREATE POLICY "Reps can manage their own leads" ON public.leads
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Managers can view all leads" ON public.leads
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for daily_visits
CREATE POLICY "Reps can manage their own visits" ON public.daily_visits
    FOR ALL USING (auth.uid() = rep_id);

CREATE POLICY "Managers can view all visits" ON public.daily_visits
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for goals
CREATE POLICY "Users can manage their own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team goals" ON public.goals
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

-- RLS Policies for conversions
CREATE POLICY "Reps can manage their own conversions" ON public.conversions
    FOR ALL USING (auth.uid() = rep_id);

CREATE POLICY "Managers can view all conversions" ON public.conversions
    FOR SELECT USING (public.is_manager_or_above(auth.uid()));

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email
  );
  
  -- Assign default role as 'rep'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'rep');
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update goal progress
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update visit goals
  UPDATE public.goals 
  SET current_value = (
    SELECT COUNT(*)::DECIMAL
    FROM public.daily_visits 
    WHERE rep_id = NEW.rep_id 
    AND visit_date BETWEEN goals.period_start AND goals.period_end
  ),
  updated_at = now()
  WHERE user_id = NEW.rep_id 
  AND goal_type = 'visits'
  AND period_start <= NEW.visit_date 
  AND period_end >= NEW.visit_date;

  RETURN NEW;
END;
$$;

-- Create trigger to update goals when visits are logged
CREATE TRIGGER update_visit_goals
  AFTER INSERT ON public.daily_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_goal_progress();
