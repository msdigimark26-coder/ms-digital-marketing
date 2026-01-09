-- 1. Dashboard Overview Stats (Top 5 Cards)
CREATE TABLE IF NOT EXISTS public.dashboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT,
    icon_key TEXT, -- 'Users', 'Briefcase', 'Calendar', 'DollarSign', 'TrendingUp'
    gradient TEXT, -- 'from-blue-600 to-blue-400'
    sort_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Projects Table (for Portfolio/Active Projects)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    client TEXT, -- Added client field
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'draft'
    progress INTEGER DEFAULT 0,
    color TEXT DEFAULT 'blue', -- 'blue', 'teal', 'amber', 'purple'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    amount TEXT NOT NULL,
    service TEXT,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies (Allow everything for authenticated/anon for now as per previous pattern)
CREATE POLICY "Allow public access dashboard_stats" ON public.dashboard_stats FOR ALL USING (true);
CREATE POLICY "Allow public access projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow public access payments" ON public.payments FOR ALL USING (true);

-- Seed Initial Data for Dashboard Stats
INSERT INTO public.dashboard_stats (title, value, label, icon_key, gradient, sort_order)
VALUES 
    ('New Leads', '25', 'NEW LEADS this week', 'Users', 'from-blue-600 to-blue-400', 1),
    ('Total Projects', '12', 'TOTAL PROJECTS Live', 'Briefcase', 'from-purple-600 to-purple-400', 2),
    ('Bookings', '8', 'BOOKINGS Scheduled', 'Calendar', 'from-teal-600 to-teal-400', 3),
    ('New Payments', '$1,580', 'Received today', 'DollarSign', 'from-amber-600 to-amber-400', 4),
    ('Revenue', '$15,480', 'Total this month', 'TrendingUp', 'from-rose-600 to-rose-400', 5)
ON CONFLICT DO NOTHING; -- No conflict clause needed for this structure usually, but good practice if IDs were fixed

-- Seed Initial Data for Projects (Active Projects)
INSERT INTO public.projects (title, client, status, progress, color)
VALUES
    ('Ecolife Rebranding', 'Ecolife', 'in_progress', 45, 'teal'),
    ('NexGen App Development', 'NexGen', 'completed', 100, 'blue'),
    ('Tesla SEO Optimization', 'Tesla', 'draft', 10, 'amber'),
    ('InnovateCo Website Redesign', 'InnovateCo', 'launching_soon', 85, 'purple');

-- Seed Initial Data for Payments
INSERT INTO public.payments (client_name, amount, service, payment_date)
VALUES
    ('Michael Lee', '$565.00', 'Web Design', now()),
    ('Sarah Thompson', '$480.00', 'SEO', now() - interval '1 day'),
    ('Adrian Mehta', '$322.00', 'UI/UX', now() - interval '2 days'),
    ('Priya Nair', '$435.00', 'PPC Ads', now() - interval '3 days');
