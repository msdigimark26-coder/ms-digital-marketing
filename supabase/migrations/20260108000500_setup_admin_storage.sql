-- Create a new storage bucket for admin logs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin_logs', 'admin_logs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users (or public if needed for this flow) to upload
CREATE POLICY "Allow public uploads to admin_logs" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'admin_logs' );

CREATE POLICY "Allow public select from admin_logs" ON storage.objects
FOR SELECT USING ( bucket_id = 'admin_logs' );
