-- Create Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create Policies (permissive for admin portal usage)
CREATE POLICY "Enable read access for all users" ON public.assets
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.assets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.assets
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.assets
    FOR DELETE USING (true);

-- Create Storage Bucket for Asset Covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('asset_covers', 'asset_covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for Asset Covers
CREATE POLICY "Public Access asset_covers" ON storage.objects
FOR ALL USING ( bucket_id = 'asset_covers' ) WITH CHECK ( bucket_id = 'asset_covers' );
