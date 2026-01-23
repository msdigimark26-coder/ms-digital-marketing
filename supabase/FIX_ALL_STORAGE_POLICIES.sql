-- =====================================================
-- FIX ALL STORAGE BUCKET RLS POLICIES
-- This fixes "new row violates row-level security policy" errors
-- for admin-avatars, notification-images, and other buckets
-- =====================================================

-- =====================================================
-- 1. ADMIN AVATARS BUCKET
-- =====================================================

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-avatars', 'admin-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public uploads to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from admin-avatars" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Allow public uploads to admin-avatars" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'admin-avatars');

CREATE POLICY "Allow public access to admin-avatars" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'admin-avatars');

CREATE POLICY "Allow public updates to admin-avatars" 
ON storage.objects
FOR UPDATE 
USING (bucket_id = 'admin-avatars');

CREATE POLICY "Allow public delete from admin-avatars" 
ON storage.objects
FOR DELETE 
USING (bucket_id = 'admin-avatars');

-- =====================================================
-- 2. NOTIFICATION IMAGES BUCKET
-- =====================================================

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notification-images', 'notification-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to notification-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to notification-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to notification-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from notification-images" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Allow public uploads to notification-images" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'notification-images');

CREATE POLICY "Allow public access to notification-images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'notification-images');

CREATE POLICY "Allow public updates to notification-images" 
ON storage.objects
FOR UPDATE 
USING (bucket_id = 'notification-images');

CREATE POLICY "Allow public delete from notification-images" 
ON storage.objects
FOR DELETE 
USING (bucket_id = 'notification-images');

-- =====================================================
-- 3. ADMIN LOGS BUCKET
-- =====================================================

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin_logs', 'admin_logs', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public uploads to admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select from admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from admin_logs" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Allow public uploads to admin_logs" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'admin_logs');

CREATE POLICY "Allow public access to admin_logs" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'admin_logs');

CREATE POLICY "Allow public updates to admin_logs" 
ON storage.objects
FOR UPDATE 
USING (bucket_id = 'admin_logs');

CREATE POLICY "Allow public delete from admin_logs" 
ON storage.objects
FOR DELETE 
USING (bucket_id = 'admin_logs');

-- =====================================================
-- 4. ANY OTHER STORAGE BUCKETS YOU MIGHT HAVE
-- =====================================================

-- List all buckets to verify
-- SELECT * FROM storage.buckets;

-- Verify all policies are created
-- SELECT * FROM pg_policies WHERE tablename = 'objects';
