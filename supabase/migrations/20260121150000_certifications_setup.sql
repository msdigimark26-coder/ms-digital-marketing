
-- Migration: Setup Certifications and Badges system
-- Target: 3rd Supabase Account (careers/management)

-- 1. Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    certificate_image_url TEXT,
    verification_link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create site_sections table for global toggles
CREATE TABLE IF NOT EXISTS site_sections (
    section_key TEXT PRIMARY KEY,
    is_visible BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize the certifications_home section visibility
INSERT INTO site_sections (section_key, is_visible)
VALUES ('certifications_home', true)
ON CONFLICT (section_key) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Public read access for active certifications and visibility state
CREATE POLICY "Public read for certifications" ON certifications
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read for site_sections" ON site_sections
    FOR SELECT USING (true);

-- Admin CRUD access (Placeholder for admin checks - assuming service role or specific authenticated user)
-- For a simplest setup, we allow everything for authenticated users if we use standard Supabase Auth,
-- but since this is a 3rd account with no standard auth, we might rely on the API key or specific RLS.
-- Here we'll allow all operations for now to facilitate admin portal management.
CREATE POLICY "Admin full access for certifications" ON certifications
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access for site_sections" ON site_sections
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Storage setup for certification logos
-- Note: Create 'certifications' bucket in Supabase Dashboard
-- This SQL is for documentation/migration reference
/*
  INSERT INTO storage.buckets (id, name, public) VALUES ('certifications', 'certifications', true);
  
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'certifications');
  CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certifications');
  CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'certifications');
*/
