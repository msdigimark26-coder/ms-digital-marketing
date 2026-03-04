-- MS DigiMark - ACCOUNT 1 (MAIN) CONSOLIDATION FIX
-- Run this in the SQL Editor of your main Supabase account (Ref: xlyzoqmifdbmrdatfbcd)

-- 1. Create MISSING Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_name TEXT,
    admin_email TEXT,
    action_type TEXT,
    target_type TEXT,
    target_id TEXT,
    target_data JSONB,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create MISSING Leads, Bookings, and Services Tables (Consolidating from Account 2)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new',
    source TEXT DEFAULT 'direct',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    service_id TEXT,
    service_name TEXT,
    budget TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services_showcase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Ensure RLS is ENABLED for all these tables
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_showcase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. APPLY ALL-ACCESS POLICIES FOR ADMINS
-- Admin Activity Logs
DROP POLICY IF EXISTS "Admin All Activity Logs" ON public.admin_activity_logs;
CREATE POLICY "Admin All Activity Logs" ON public.admin_activity_logs FOR ALL USING (true);

-- Leads
DROP POLICY IF EXISTS "Admin All Leads" ON public.leads;
CREATE POLICY "Admin All Leads" ON public.leads FOR ALL USING (true);
DROP POLICY IF EXISTS "Public Insert Leads" ON public.leads;
CREATE POLICY "Public Insert Leads" ON public.leads FOR INSERT WITH CHECK (true);

-- Bookings
DROP POLICY IF EXISTS "Admin All Bookings" ON public.bookings;
CREATE POLICY "Admin All Bookings" ON public.bookings FOR ALL USING (true);

-- Services Showcase
DROP POLICY IF EXISTS "Admin All Showcase" ON public.services_showcase;
CREATE POLICY "Admin All Showcase" ON public.services_showcase FOR ALL USING (true);
DROP POLICY IF EXISTS "Public View Showcase" ON public.services_showcase;
CREATE POLICY "Public View Showcase" ON public.services_showcase FOR SELECT USING (true);

-- Notifications (Fix for empty UI)
DROP POLICY IF EXISTS "Admin All Notifications" ON public.notifications;
CREATE POLICY "Admin All Notifications" ON public.notifications FOR ALL USING (true);
DROP POLICY IF EXISTS "Public Select Notifications" ON public.notifications;
CREATE POLICY "Public Select Notifications" ON public.notifications FOR SELECT USING (true);
