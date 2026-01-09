-- Ensure admin_logs bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin_logs', 'admin_logs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop potentially conflicting restrictive policies
DROP POLICY IF EXISTS "Allow public uploads to admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select from admin_logs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Create broad permission policies for admin_logs
CREATE POLICY "Public Access admin_logs" ON storage.objects
FOR ALL USING ( bucket_id = 'admin_logs' ) WITH CHECK ( bucket_id = 'admin_logs' );
