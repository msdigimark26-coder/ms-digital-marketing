-- Add image_url column to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS image_url text;

-- Create a storage bucket for testimonial images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial-images', 'testimonial-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the storage bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'testimonial-images' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'testimonial-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'testimonial-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'testimonial-images' AND auth.role() = 'authenticated' );
