-- MS DigiMark - DEFINITIVE BACKEND RLS FIX (v5)
-- Use this script to fix permissions for Team and Testimonials.

-- 1. ENSURE BUCKETS EXIST
-- Run this to make sure your buckets are ready.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-images', 'employee-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('testimonial-images', 'testimonial-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. CREATE STORAGE POLICIES
-- Clean way to add full access to buckets.
DROP POLICY IF EXISTS "Universal_employee_images" ON storage.objects;
CREATE POLICY "Universal_employee_images" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'employee-images')
WITH CHECK (bucket_id = 'employee-images');

DROP POLICY IF EXISTS "Universal_testimonial_images" ON storage.objects;
CREATE POLICY "Universal_testimonial_images" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'testimonial-images')
WITH CHECK (bucket_id = 'testimonial-images');

-- 3. TABLE PERMISSIONS (Employees & Testimonials)
-- Enable RLS and add permissive policies.
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Portal_Permissive_employees" ON public.employees;
CREATE POLICY "Portal_Permissive_employees" ON public.employees
FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Portal_Permissive_testimonials" ON public.testimonials;
CREATE POLICY "Portal_Permissive_testimonials" ON public.testimonials
FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. FINAL PRIVILEGE GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
