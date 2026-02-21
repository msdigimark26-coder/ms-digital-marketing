-- MS DigiMark - Consolidated Migration SQL
-- Target Project: https://xlyzoqmifdbmrdatfbcd.supabase.co
-- Generated on: 2026-02-21

-- 0. PREPARATION
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'user', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PORTAL USERS (Base table for others)
CREATE TABLE IF NOT EXISTS public.portal_users (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  email text not null unique,
  password text not null,
  role text default 'admin' not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  avatar_url TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_device TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. USER ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 5. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ADMIN ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID,
    admin_email TEXT,
    admin_name TEXT,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_data JSONB,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. ADMIN LOGIN LOGS
CREATE TABLE IF NOT EXISTS public.admin_login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.portal_users(id),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    logout_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    captured_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. ADMIN MESSAGES
CREATE TABLE IF NOT EXISTS public.admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.portal_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. ASSETS
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. DASHBOARD STATS
CREATE TABLE IF NOT EXISTS public.dashboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT,
    icon_key TEXT,
    gradient TEXT,
    sort_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    client TEXT,
    status TEXT DEFAULT 'in_progress',
    progress INTEGER DEFAULT 0,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    amount TEXT NOT NULL,
    service TEXT,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15. EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    cover_image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 16. REELS (MOVED TO DEDICATED ACCOUNT - DO NOT CREATE HERE)
-- 17. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'marketing',
    price TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 18. ENABLE RLS FOR ALL TABLES
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 19. ATTACH POLICIES (Permissive for initial migration, refine as needed)
CREATE POLICY "Public Read Access" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.dashboard_stats FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.services FOR SELECT USING (true);

-- Admin Policies (Simplified for migration)
CREATE POLICY "Full Admin Access portal_users" ON public.portal_users FOR ALL USING (true);
CREATE POLICY "Full Admin Access admin_activity_logs" ON public.admin_activity_logs FOR ALL USING (true);
CREATE POLICY "Full Admin Access admin_login_logs" ON public.admin_login_logs FOR ALL USING (true);
CREATE POLICY "Full Admin Access admin_messages" ON public.admin_messages FOR ALL USING (true);

-- 20. SEED INITIAL DATA
-- (Only including essential system data, user data must be exported/imported)

-- Portal Users
INSERT INTO public.portal_users (username, email, password, role) VALUES
  ('msdigimark', 'headofms@msdigimark.org', '$msdigimark@2026', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Dashboard Stats
INSERT INTO public.dashboard_stats (title, value, label, icon_key, gradient, sort_order)
VALUES 
    ('New Leads', '25', 'NEW LEADS this week', 'Users', 'from-blue-600 to-blue-400', 1),
    ('Total Projects', '12', 'TOTAL PROJECTS Live', 'Briefcase', 'from-purple-600 to-purple-400', 2),
    ('Bookings', '8', 'BOOKINGS Scheduled', 'Calendar', 'from-teal-600 to-teal-400', 3),
    ('New Payments', '$1,580', 'Received today', 'DollarSign', 'from-amber-600 to-amber-400', 4),
    ('Revenue', '$15,480', 'Total this month', 'TrendingUp', 'from-rose-600 to-rose-400', 5)
ON CONFLICT DO NOTHING;

-- Employees
INSERT INTO public.employees (name, title, description, image_url, display_order)
VALUES
    ('Sai sankeet', 'Digital Marketing Head & Business Strategy', 'SEO & Content Marketing', '/Team Members 2/1.png', 1),
    ('Britto', 'Front-end Developer & UI/UX Designer', 'Website Development & 3D Modeling', '/Team Members 2/2.png', 2)
ON CONFLICT DO NOTHING;

-- Services
INSERT INTO public.services (title, description, category, price)
VALUES 
    ('SEO Optimization', 'Improve your website ranking on Google.', 'Marketing', '$500 - $1,500'),
    ('Web Development', 'Custom website design and development.', 'Development', '$1,000 - $5,000')
ON CONFLICT DO NOTHING;

-- 21. STORAGE BUCKETS SETUP
-- Note: These must be created in the Supabase Dashboard, but SQL can help if extensions are enabled
-- INSERT INTO storage.buckets (id, name, public) VALUES ('asset_covers', 'asset_covers', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('employee-images', 'employee-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reels', 'reels', true) ON CONFLICT DO NOTHING;
