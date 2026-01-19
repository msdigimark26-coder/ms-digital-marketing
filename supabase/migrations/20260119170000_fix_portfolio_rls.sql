-- FIX: Update RLS policies to allow Public/Anon updates
-- This is necessary because the Admin Panel uses the public/anon key for the Services instance.

-- 1. Grant full access to portfolio_projects table for everyone
DROP POLICY IF EXISTS "Public can view active portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can manage portfolio projects" ON public.portfolio_projects;

CREATE POLICY "Public full access"
ON public.portfolio_projects
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Grant full access to portfolio-images bucket for everyone
DROP POLICY IF EXISTS "Public Access to Portfolio Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio images" ON storage.objects;

CREATE POLICY "Public full access to portfolio images"
ON storage.objects
FOR ALL
USING (bucket_id = 'portfolio-images')
WITH CHECK (bucket_id = 'portfolio-images');
