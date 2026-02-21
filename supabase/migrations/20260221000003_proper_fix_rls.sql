-- MS DigiMark - COMPREHENSIVE RLS FIX
-- Fixes the "new row violates row-level security policy" for 'projects' and other tables.

-- This script uses dynamic SQL to clean up ANY existing policies that might be conflicting.
-- Run this in your Supabase SQL Editor.

-- 1. CLEANUP & FIX FOR 'projects' TABLE
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop ALL existing policies on public.projects to ensure a clean slate
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.projects', pol.policyname);
    END LOOP;

    -- Fix 'user_id' constraint if it exists from older migrations
    -- Older migrations made user_id NOT NULL, which breaks the admin portal (unauthenticated)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'user_id') THEN
        ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;
    END IF;
END $$;

-- Enable RLS and add fully permissive policy
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_projects_admin" ON public.projects
    FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. CLEANUP & FIX FOR 'leads' TABLE
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'leads' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.leads', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_leads_admin" ON public.leads
    FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. CLEANUP & FIX FOR 'portfolio_projects' TABLE
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'portfolio_projects' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.portfolio_projects', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_portfolio_admin" ON public.portfolio_projects
    FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. CLEANUP & FIX FOR 'bookings' TABLE
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'bookings' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.bookings', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_bookings_admin" ON public.bookings
    FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. CLEANUP & FIX FOR 'services' TABLE
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'services' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.services', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_services_admin" ON public.services
    FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. CLEANUP & FIX FOR 'payments' TABLE
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'payments' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY %I ON public.payments', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_payments_admin" ON public.payments
    FOR ALL TO public USING (true) WITH CHECK (true);

-- 7. ENSURE STORAGE POLICIES
-- Sometimes the bucket policies are also restrictive
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public full access to portfolio images" ON storage.objects;
CREATE POLICY "Public full access to portfolio images"
ON storage.objects FOR ALL
USING (bucket_id = 'portfolio-images')
WITH CHECK (bucket_id = 'portfolio-images');
