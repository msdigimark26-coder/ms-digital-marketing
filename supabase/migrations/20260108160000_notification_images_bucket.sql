-- Create a new storage bucket for notification images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notification-images', 'notification-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for notification-images bucket

-- 1. Public Read Access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'notification-images' );

-- 2. Authenticated Upload Access (or Admin only if possible, but keeping it simple for now)
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'notification-images' AND auth.role() = 'authenticated' );

-- 3. Authenticated Update/Delete Access
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'notification-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'notification-images' AND auth.role() = 'authenticated' );
