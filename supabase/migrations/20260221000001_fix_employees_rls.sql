-- Ensure the employees table exists
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cover_image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed with default data if empty
INSERT INTO public.employees (name, title, description, image_url, display_order, is_active)
SELECT 'Sai sankeet', 'Digital Marketing Head & Business Strategy', 'SEO & Content Marketing • Social Media Marketing • PPC & Paid Advertising', 'https://via.placeholder.com/150', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.employees);

INSERT INTO public.employees (name, title, description, image_url, display_order, is_active)
SELECT 'Britto', 'Front-end Developer & UI/UX Designer', 'Website Development • User Interface Design • 3D Modeling', 'https://via.placeholder.com/150', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE name = 'Britto');

INSERT INTO public.employees (name, title, description, image_url, display_order, is_active)
SELECT 'Arivalagan', 'UI/UX Designer & Editor', 'User Interface Design • User Experience Design • Prototyping & Wireframes', 'https://via.placeholder.com/150', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE name = 'Arivalagan');

INSERT INTO public.employees (name, title, description, image_url, display_order, is_active)
SELECT 'Abdul razaak', 'Project Manager & Editor', 'Project Planning • Client Coordination • Quality Assurance', 'https://via.placeholder.com/150', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.employees WHERE name = 'Abdul razaak');

-- Ensure RLS is enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Drop ALL possible existing policies for this table
DROP POLICY IF EXISTS "Public can read employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can update employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON public.employees;
DROP POLICY IF EXISTS "Admin All Employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public select on employees" ON public.employees;
DROP POLICY IF EXISTS "Enable all for anon on employees" ON public.employees;

-- Create highly permissive policy for BOTH anon and authenticated
-- This is critical because the admin portal uses custom auth (anon client)
CREATE POLICY "Permissive All for Employees" ON public.employees
    FOR ALL 
    TO public
    USING (true)
    WITH CHECK (true);

-- Explicitly allow for anon role just in case
CREATE POLICY "Anon All for Employees" ON public.employees
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);
