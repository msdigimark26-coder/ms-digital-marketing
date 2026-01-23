-- MS DigiMark Blog System Migration
-- Target: Supabase Project ogeqzcluyafngfobsrqw

-- 1. Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    category TEXT DEFAULT 'Tech',
    featured_image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_name TEXT DEFAULT 'MS DigiMark Team',
    theme_color TEXT DEFAULT 'purple', -- purple, blue, emerald, rose, amber
    
    -- SEO Metadata
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FORCE ADD columns if they are missing
ALTER TABLE articles ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'purple';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'MS DigiMark Team';

-- 3. Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 4. Fix existing NULL values
UPDATE articles SET likes_count = 0 WHERE likes_count IS NULL;
UPDATE articles SET view_count = 0 WHERE view_count IS NULL;

-- 5. Clear existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON articles;
DROP POLICY IF EXISTS "Full access for management" ON articles;

-- 6. Create proper policies for multi-project setup
CREATE POLICY "Public can view published articles"
ON articles FOR SELECT
USING (status = 'published');

CREATE POLICY "Full access for management"
ON articles FOR ALL
USING (true)
WITH CHECK (true);

-- 7. Analytics Functions (Improved with COALESCE)
CREATE OR REPLACE FUNCTION increment_article_view(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles
    SET 
        view_count = COALESCE(view_count, 0) + 1,
        last_viewed_at = NOW()
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_article_likes(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to functions
GRANT EXECUTE ON FUNCTION increment_article_view(UUID) TO public, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_article_likes(UUID) TO public, anon, authenticated;

-- 8. Storage Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog_images', 'blog_images', true)
ON CONFLICT (id) DO NOTHING;

-- Clear storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload blog images" ON storage.objects;

-- Storage Policies
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING ( bucket_id = 'blog_images' );

CREATE POLICY "Anyone can upload blog images"
ON storage.objects FOR ALL
TO anon, authenticated
USING ( bucket_id = 'blog_images' )
WITH CHECK ( bucket_id = 'blog_images' );
