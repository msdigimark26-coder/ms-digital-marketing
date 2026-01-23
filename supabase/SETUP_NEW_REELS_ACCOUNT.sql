-- =====================================================
-- SETUP FOR NEW REELS SUPABASE PROJECT
-- Project: jhktcgzyfphywwxarwwm
-- Run this in the SQL Editor of your NEW Superbase account
-- =====================================================

-- 1. Create the reels table
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    description TEXT,
    video_url TEXT NOT NULL,
    aspect_ratio TEXT DEFAULT '9:16',
    page_section TEXT[] DEFAULT ARRAY['home'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive policies for the table (allows custom auth)
DROP POLICY IF EXISTS "Public reels are viewable by everyone" ON public.reels;
CREATE POLICY "Public reels are viewable by everyone" 
ON public.reels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public management of reels" ON public.reels;
CREATE POLICY "Allow public management of reels" 
ON public.reels FOR ALL USING (true);

-- 4. Create storage bucket for reels
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reels', 'reels', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Storage policies for reels bucket (allows public uploads)
DROP POLICY IF EXISTS "Allow public uploads to reels" ON storage.objects;
CREATE POLICY "Allow public uploads to reels" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reels');

DROP POLICY IF EXISTS "Allow public access to reels" ON storage.objects;
CREATE POLICY "Allow public access to reels" 
ON storage.objects FOR SELECT USING (bucket_id = 'reels');

DROP POLICY IF EXISTS "Allow public updates to reels" ON storage.objects;
CREATE POLICY "Allow public updates to reels" 
ON storage.objects FOR UPDATE USING (bucket_id = 'reels');

DROP POLICY IF EXISTS "Allow public delete from reels" ON storage.objects;
CREATE POLICY "Allow public delete from reels" 
ON storage.objects FOR DELETE USING (bucket_id = 'reels');

-- 6. Verify setup
SELECT 'Setup Complete!' as status;
