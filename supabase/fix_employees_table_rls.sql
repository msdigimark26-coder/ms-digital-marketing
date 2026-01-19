-- Check and fix EMPLOYEES table RLS policies
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY cmd;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;

-- Create new policies with correct permissions
CREATE POLICY "Public can read employees"
ON employees FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can insert employees"
ON employees FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update employees"
ON employees FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can delete employees"
ON employees FOR DELETE
TO authenticated
USING (true);

-- Verify policies were created
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY cmd;
