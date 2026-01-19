-- COMPLETE FIX: Remove ALL restrictions and make storage fully accessible
-- This will DEFINITELY work - Run in Supabase SQL Editor

-- Step 1: Drop ALL existing policies on storage.objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects CASCADE';
    END LOOP;
END $$;

-- Step 2: Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'employee-images';

-- Step 3: Create SUPER PERMISSIVE policies (will work for everyone)
CREATE POLICY "Allow all to view employee images"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-images');

CREATE POLICY "Allow all to upload employee images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-images');

CREATE POLICY "Allow all to update employee images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-images');

CREATE POLICY "Allow all to delete employee images"
ON storage.objects FOR DELETE
USING (bucket_id = 'employee-images');

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
