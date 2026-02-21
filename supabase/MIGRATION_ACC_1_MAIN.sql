-- MS DigiMark - ACCOUNT 1 (MAIN PORTAL)
-- Project: xlyzoqmifdbmrdatfbcd (Supabase Main)
-- Purpose: Authentication, Client Portal, Admin Hub

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'user', 'superadmin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. PORTAL USERS
CREATE TABLE IF NOT EXISTS public.portal_users (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  email text not null unique,
  password text not null,
  role text default 'admin' not null,
  avatar_url text,
  full_name text,
  employee_id text,
  department text,
  id_card_status text default 'Active',
  id_card_issued_at timestamp with time zone,
  biometric_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. PROFILES (Linked to Auth)
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

-- 3. USER ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. DASHBOARD STATS
CREATE TABLE IF NOT EXISTS public.dashboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT,
    icon_key TEXT,
    gradient TEXT,
    sort_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. NOTIFICATIONS & TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ASSETS & EMPLOYEES
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. CLIENT PORTAL CORE (Projects, Invoices, Payments)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'in_progress',
  progress INTEGER DEFAULT 0,
  start_date DATE,
  expected_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_reference TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. ADMIN LOGS & MESSAGES
CREATE TABLE IF NOT EXISTS public.admin_login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.portal_users(id),
    status TEXT NOT NULL,
    captured_image_url TEXT,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    logout_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.portal_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for ALL tables
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Admin Access (Global)
CREATE POLICY "Allow public select on portal_users" ON public.portal_users FOR SELECT USING (true);
CREATE POLICY "Allow admin all on portal_users" ON public.portal_users FOR ALL USING (true);

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Public Content (Read Only)
CREATE POLICY "Allow public select on dashboard_stats" ON public.dashboard_stats FOR SELECT USING (true);
CREATE POLICY "Allow public select on notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public select on testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public select on assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Allow public select on employees" ON public.employees FOR SELECT USING (true);

-- Client Portal Policies
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Admin Global Access
CREATE POLICY "Admin All" ON public.dashboard_stats FOR ALL USING (true);
CREATE POLICY "Admin All Notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Admin All Testimonials" ON public.testimonials FOR ALL USING (true);
CREATE POLICY "Admin All Assets" ON public.assets FOR ALL USING (true);
CREATE POLICY "Admin All Employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Admin All Projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Admin All Invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Admin All Payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Admin All Login Logs" ON public.admin_login_logs FOR ALL USING (true);
CREATE POLICY "Admin All Messages" ON public.admin_messages FOR ALL USING (true);
