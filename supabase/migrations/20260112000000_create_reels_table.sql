
-- Create reels table
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    description TEXT,
    video_url TEXT NOT NULL,
    aspect_ratio TEXT DEFAULT '9:16',
    page_section TEXT DEFAULT 'home',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Policies for reels
DROP POLICY IF EXISTS "Public reels are viewable by everyone" ON public.reels;
CREATE POLICY "Public reels are viewable by everyone" ON public.reels
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage reels" ON public.reels;
CREATE POLICY "Admins can manage reels" ON public.reels
    FOR ALL USING (true);

-- Create storage bucket for reels
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reels', 'reels', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for reels bucket
DROP POLICY IF EXISTS "Public Access Reels" ON storage.objects;
CREATE POLICY "Public Access Reels" ON storage.objects
    FOR SELECT USING (bucket_id = 'reels');

DROP POLICY IF EXISTS "Admin Upload Reels" ON storage.objects;
CREATE POLICY "Admin Upload Reels" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'reels');

DROP POLICY IF EXISTS "Admin Update Reels" ON storage.objects;
CREATE POLICY "Admin Update Reels" ON storage.objects
    FOR UPDATE USING (bucket_id = 'reels');

DROP POLICY IF EXISTS "Admin Delete Reels" ON storage.objects;
CREATE POLICY "Admin Delete Reels" ON storage.objects
    FOR DELETE USING (bucket_id = 'reels');
