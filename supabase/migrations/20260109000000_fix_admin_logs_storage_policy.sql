-- Make admin_logs bucket fully public and permissive for debugging
UPDATE storage.buckets SET public = true WHERE id = 'admin_logs';

-- Drop existing policies to be clean
DROP POLICY IF EXISTS "Allow public uploads to admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select from admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow all access to admin_logs" ON storage.objects;

-- Create a comprehensive policy for all operations
CREATE POLICY "Allow all access to admin_logs" ON storage.objects
FOR ALL USING (bucket_id = 'admin_logs') WITH CHECK (bucket_id = 'admin_logs');
