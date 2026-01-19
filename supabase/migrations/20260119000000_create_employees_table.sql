-- Create employees table for team members
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    cover_image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create storage bucket for employee images
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-images', 'employee-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Public can read employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON employees;

-- Policies for employees table
-- Allow public read access
CREATE POLICY "Public can read employees"
ON employees FOR SELECT
USING (true);

-- Only authenticated admins can insert, update, delete
CREATE POLICY "Admins can insert employees"
ON employees FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update employees"
ON employees FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete employees"
ON employees FOR DELETE
USING (auth.role() = 'authenticated');

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public can view employee images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload employee images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update employee images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete employee images" ON storage.objects;

-- Storage policies for employee-images bucket
CREATE POLICY "Public can view employee images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-images');

CREATE POLICY "Authenticated users can upload employee images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-images');

CREATE POLICY "Authenticated users can update employee images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'employee-images');

CREATE POLICY "Authenticated users can delete employee images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee-images');

-- Insert existing team members data
INSERT INTO employees (name, title, description, image_url, display_order, is_active)
VALUES
    ('Sai sankeet', 'Digital Marketing Head & Business Strategy', 'SEO & Content Marketing • Social Media Marketing • PPC & Paid Advertising', '/Team Members 2/1.png', 1, true),
    ('Britto', 'Front-end Developer & UI/UX Designer', 'Website Development • User Interface Design • 3D Modeling', '/Team Members 2/2.png', 2, true),
    ('Arivalagan', 'UI/UX Designer & Editor', 'User Interface Design • User Experience Design • Prototyping & Wireframes', '/Team Members 2/3.png', 3, true),
    ('Abdul razaak', 'Project Manager & Editor', 'Project Planning • Client Coordination • Quality Assurance', '/Team Members 2/4.png', 4, true),
    ('Joel Kevin', 'Social Media Manager', 'Account Handling • Content Strategy • Audience Engagement', '/Team Members 2/5.png', 5, true),
    ('Baptis', 'Creative Designer', 'Banner & Ad Design • YouTube Thumbnails • Instagram Creatives', '/Team Members 2/6.png', 6, true),
    ('Rahul ji', 'Video Editor', 'Video Editing • Motion Graphics • Platform-Optimized Content', '/Team Members 2/7.png', 7, true),
    ('Sangeeth', 'Back-end Developer', 'Secure Architecture • API & Database Management • Scalable & High Performance', '/Team Members 2/8.png', 8, true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
