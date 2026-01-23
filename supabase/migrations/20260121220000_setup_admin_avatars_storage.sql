-- Create storage bucket for admin avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-avatars', 'admin-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to admin-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from admin-avatars" ON storage.objects;

-- Create policies for admin-avatars bucket
-- Allow anyone to upload (you can restrict this to authenticated users if needed)
CREATE POLICY "Allow public uploads to admin-avatars" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'admin-avatars');

-- Allow anyone to view/download avatars
CREATE POLICY "Allow public access to admin-avatars" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'admin-avatars');

-- Allow anyone to update their avatars
CREATE POLICY "Allow public updates to admin-avatars" 
ON storage.objects
FOR UPDATE 
USING (bucket_id = 'admin-avatars');

-- Allow anyone to delete avatars
CREATE POLICY "Allow public delete from admin-avatars" 
ON storage.objects
FOR DELETE 
USING (bucket_id = 'admin-avatars');
