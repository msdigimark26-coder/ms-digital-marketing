-- =====================================================
-- RESUME STORAGE BUCKET SETUP
-- For storing candidate resumes/CVs
-- =====================================================

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads (anyone can upload their resume)
CREATE POLICY "Anyone can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

-- Allow public read access (so admins can download)
CREATE POLICY "Public can view resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

-- Only service role can delete (admin cleanup)
CREATE POLICY "Service role can delete resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes');
