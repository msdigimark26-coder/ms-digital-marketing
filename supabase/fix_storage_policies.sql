-- IMMEDIATE FIX for cover image upload error
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Step 1: Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'employee-images';

-- Step 2: Remove old policies that might be causing issues
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname LIKE '%employee%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Step 3: Create new working policies
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

-- Verification query (optional - shows all policies for employee-images)
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
AND policyname LIKE '%employee%';
