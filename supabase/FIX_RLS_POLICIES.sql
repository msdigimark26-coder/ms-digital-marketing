-- FIX RLS POLICIES FOR ADMIN PORTAL
-- Run this in your Supabase SQL Editor (Main Account)

-- 1. ASSETS TABLE
DROP POLICY IF EXISTS "Allow public select on assets" ON public.assets;
DROP POLICY IF EXISTS "Admin All Assets" ON public.assets;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.assets;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.assets;
DROP POLICY IF EXISTS "Enable update for all users" ON public.assets;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.assets;

CREATE POLICY "Allow public read assets" ON public.assets FOR SELECT TO public USING (true);
CREATE POLICY "Allow all assets for anon" ON public.assets FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. EMPLOYEES TABLE
DROP POLICY IF EXISTS "Allow public select on employees" ON public.employees;
DROP POLICY IF EXISTS "Admin All Employees" ON public.employees;
DROP POLICY IF EXISTS "Public can read employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can update employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON public.employees;

CREATE POLICY "Allow public read employees" ON public.employees FOR SELECT TO public USING (true);
CREATE POLICY "Allow all employees for anon" ON public.employees FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. TESTIMONIALS TABLE
DROP POLICY IF EXISTS "Allow public select on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin All Testimonials" ON public.testimonials;

CREATE POLICY "Allow public read testimonials" ON public.testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Allow all testimonials for anon" ON public.testimonials FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. PORTAL USERS (Settings Section updates)
DROP POLICY IF EXISTS "Allow public select on portal_users" ON public.portal_users;
DROP POLICY IF EXISTS "Allow admin all on portal_users" ON public.portal_users;

CREATE POLICY "Allow all portal_users for anon" ON public.portal_users FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. ADMIN LOGIN LOGS (Face Auth storage)
DROP POLICY IF EXISTS "Admin All Login Logs" ON public.admin_login_logs;

CREATE POLICY "Allow all login_logs for anon" ON public.admin_login_logs FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. DASHBOARD STATS
DROP POLICY IF EXISTS "Allow public select on dashboard_stats" ON public.dashboard_stats;
DROP POLICY IF EXISTS "Admin All" ON public.dashboard_stats;

CREATE POLICY "Allow all dashboard_stats for anon" ON public.dashboard_stats FOR ALL TO public USING (true) WITH CHECK (true);

-- 7. NOTIFICATIONS
DROP POLICY IF EXISTS "Allow public select on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin All Notifications" ON public.notifications;

CREATE POLICY "Allow all notifications for anon" ON public.notifications FOR ALL TO public USING (true) WITH CHECK (true);
