-- Create projects table for internal tracking
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    client TEXT,
    status TEXT DEFAULT 'in_progress', -- e.g., 'completed', 'in_progress', 'scheduled'
    progress INTEGER DEFAULT 0, -- 0 to 100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active RLS policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access (if you want clients to optionally view their project status)
CREATE POLICY "Allow public read projects" 
ON public.projects FOR SELECT 
USING (true);

-- Allow authenticated users (Admins) all access
CREATE POLICY "Allow authenticated users all access to projects" 
ON public.projects FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert some dummy data so the tracker isn't blank
INSERT INTO public.projects (title, description, client, status, progress) VALUES
('Website Redesign', 'Revamp corporate website with new branding and optimized landing pages.', 'Acme Corp', 'in_progress', 65),
('Google Ads Campaign', 'Launch Q4 paid search campaign targeting enterprise clients.', 'TechFlow', 'scheduled', 10),
('Social Media Audit', 'Comprehensive audit and strategy formulation for Instagram and LinkedIn.', 'StyleHub', 'completed', 100);
