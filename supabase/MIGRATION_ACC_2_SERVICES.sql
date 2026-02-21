-- MS DigiMark - ACCOUNT 2 (SERVICES & LEADS)
-- Project: vdzbivereddaywgwjfxt (Services Showcase)
-- Purpose: Leads, Booking, Service Showcase, Portfolio

-- 1. LEADS & BOOKINGS
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    phone TEXT,
    service TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT,
    client_email TEXT,
    service_type TEXT,
    booking_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    budget TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. SERVICES & SHOWCASE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services_showcase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. PORTFOLIO PROJECTS
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    client TEXT,
    category TEXT,
    image_url TEXT,
    project_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. ADMIN ACTIVITY LOGS (Used in Audit Center)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name TEXT,
    admin_email TEXT,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    target_data JSONB,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for ALL tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_showcase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Public Content Policies (Read Only)
CREATE POLICY "Allow public select on services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public select on services_showcase" ON public.services_showcase FOR SELECT USING (true);
CREATE POLICY "Allow public select on portfolio" ON public.portfolio_projects FOR SELECT USING (true);

-- 2. Lead Submission Policies (Insert Only)
CREATE POLICY "Allow public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- 3. Admin Policies (Full Access)
CREATE POLICY "Allow admin all on leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow admin all on bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Allow admin all on services" ON public.services FOR ALL USING (true);
CREATE POLICY "Allow admin all on showcase" ON public.services_showcase FOR ALL USING (true);
CREATE POLICY "Allow admin all on projects" ON public.portfolio_projects FOR ALL USING (true);
CREATE POLICY "Allow admin all on activity_logs" ON public.admin_activity_logs FOR ALL USING (true);
