-- Ensure admin_logs bucket is configured correctly for anonymous access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('admin_logs', 'admin_logs', true, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Public Access admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow all access to admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Give anon access to admin_logs" ON storage.objects;

-- Create a clear, permissive policy for Anonymous uploads (since admin login happens before auth)
CREATE POLICY "Give anon access to admin_logs" ON storage.objects
FOR ALL 
TO public 
USING (bucket_id = 'admin_logs') 
WITH CHECK (bucket_id = 'admin_logs');
