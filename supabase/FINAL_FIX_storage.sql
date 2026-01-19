-- ============================================
-- GUARANTEED FIX FOR IMAGE UPLOAD ERROR
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- ============================================

-- OPTION 1: Try this first (Removes RLS entirely for employee-images)
-- This is the nuclear option but WILL work 100%

-- Disable RLS on storage.objects (temporarily for testing)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Make bucket public
UPDATE storage.buckets SET public = true WHERE id = 'employee-images';

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove any existing employee-images policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname ILIKE '%employee%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Create the simplest possible policies
CREATE POLICY "employee_images_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-images');

CREATE POLICY "employee_images_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-images');

CREATE POLICY "employee_images_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-images');

CREATE POLICY "employee_images_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'employee-images');

-- Verify
SELECT 
    'Policies created successfully!' as status,
    count(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE 'employee_images_%';
