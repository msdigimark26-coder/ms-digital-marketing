-- ============================================================
-- Client Collaborations Table (Reels Supabase - 4th Account)
-- Run this in: https://jhktcgzyfphywwxarrwm.supabase.co
-- SQL Editor → New Query → Paste & Run
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.client_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.client_collaborations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: public read, anon/authenticated write
CREATE POLICY "Allow public read on client_collaborations"
  ON public.client_collaborations FOR SELECT USING (true);

CREATE POLICY "Allow insert on client_collaborations"
  ON public.client_collaborations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on client_collaborations"
  ON public.client_collaborations FOR UPDATE USING (true);

CREATE POLICY "Allow delete on client_collaborations"
  ON public.client_collaborations FOR DELETE USING (true);

-- ============================================================
-- ALSO: Create the Storage Bucket and Policies
-- ============================================================

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to the bucket
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'client-logos');

-- 3. Allow authenticated users to upload and delete logos
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-logos');

CREATE POLICY "Authenticated users can update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'client-logos');

CREATE POLICY "Authenticated users can delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'client-logos');
