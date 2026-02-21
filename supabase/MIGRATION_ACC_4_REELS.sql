-- MS DigiMark - ACCOUNT 4 (REELS ONLY)
-- Project: jhktcgzyfphywwxarrwm
-- URI: postgresql://postgres:[@7HPE-3vqvR86Dk]@db.jhktcgzyfphywwxarrwm.supabase.co:5432/postgres

CREATE TABLE IF NOT EXISTS public.reels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    description TEXT,
    video_url TEXT NOT NULL,
    aspect_ratio TEXT DEFAULT '9:16',
    page_section TEXT DEFAULT 'home',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read reels" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Admin All" ON public.reels FOR ALL USING (true);

-- Storage (Reference)
-- Create bucket: 'reels' (Public)
