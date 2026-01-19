-- ULTIMATE FIX: Force remove and recreate storage policies
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL policies for storage.objects related to employee-images
DO $$ 
BEGIN
    -- Drop policies one by one, ignoring errors if they don't exist
    EXECUTE 'DROP POLICY IF EXISTS "Public can view employee images" ON storage.objects CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can upload employee images" ON storage.objects CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update employee images" ON storage.objects CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete employee images" ON storage.objects CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can upload employee images" ON storage.objects CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view employee images" ON storage.objects CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can update employee images" ON storage.objects CASCADE';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can delete employee images" ON storage.objects CASCADE';
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors
END $$;

-- Step 2: Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'employee-images';

-- Step 3: Create fresh policies with simplified permissions
CREATE POLICY "Public can view employee images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-images');

CREATE POLICY "Authenticated users can upload employee images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-images');

CREATE POLICY "Authenticated users can update employee images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'employee-images');

CREATE POLICY "Authenticated users can delete employee images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee-images');

-- Confirmation message
SELECT 'Storage policies successfully recreated!' as status;
