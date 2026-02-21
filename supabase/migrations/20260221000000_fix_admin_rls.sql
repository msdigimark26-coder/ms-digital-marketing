-- FIX: Row Level Security policies for MS DigiMark Admin Portal
-- Date: 2026-02-21
-- Purpose: Allow unauthenticated (anon) clients used by the admin portal to manage content 
-- because the portal uses a custom login system instead of Supabase Auth.

-- 1. NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow admins to update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow admins to delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin All Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public read access" ON public.notifications;

CREATE POLICY "Enable all for anon on notifications" ON public.notifications
    FOR ALL USING (true) WITH CHECK (true);

-- 2. TESTIMONIALS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admins to insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admins to update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow admins to delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin All Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access" ON public.testimonials;

CREATE POLICY "Enable all for anon on testimonials" ON public.testimonials
    FOR ALL USING (true) WITH CHECK (true);

-- 3. ASSETS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin All Assets" ON public.assets;
DROP POLICY IF EXISTS "Allow public select on assets" ON public.assets;

CREATE POLICY "Enable all for anon on assets" ON public.assets
    FOR ALL USING (true) WITH CHECK (true);

-- 4. PORTAL USERS / ADMINS
-- Ensure admins can update their own profiles and manage other admins
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on portal_users" ON public.portal_users;
DROP POLICY IF EXISTS "Allow admin all on portal_users" ON public.portal_users;

CREATE POLICY "Enable all for anon on portal_users" ON public.portal_users
    FOR ALL USING (true) WITH CHECK (true);

-- 5. ADMIN LOGIN LOGS
ALTER TABLE public.admin_login_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin All Login Logs" ON public.admin_login_logs;

CREATE POLICY "Enable all for anon on login_logs" ON public.admin_login_logs
    FOR ALL USING (true) WITH CHECK (true);

-- 6. DASHBOARD STATS
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin All" ON public.dashboard_stats;
DROP POLICY IF EXISTS "Allow public select on dashboard_stats" ON public.dashboard_stats;

CREATE POLICY "Enable all for anon on dashboard_stats" ON public.dashboard_stats
    FOR ALL USING (true) WITH CHECK (true);

-- 7. STORAGE POLICIES
-- Create policies for specific buckets to allow management by the portal (anon)

-- Notification Images
CREATE POLICY "Manage Notification Images" ON storage.objects 
    FOR ALL USING (bucket_id = 'notification-images') 
    WITH CHECK (bucket_id = 'notification-images');

-- Testimonial Images
CREATE POLICY "Manage Testimonial Images" ON storage.objects 
    FOR ALL USING (bucket_id = 'testimonial-images') 
    WITH CHECK (bucket_id = 'testimonial-images');

-- Admin Avatars
CREATE POLICY "Manage Admin Avatars" ON storage.objects 
    FOR ALL USING (bucket_id = 'admin-avatars') 
    WITH CHECK (bucket_id = 'admin-avatars');

-- Assets
CREATE POLICY "Manage Asset Images" ON storage.objects 
    FOR ALL USING (bucket_id = 'asset-images') 
    WITH CHECK (bucket_id = 'asset-images');
