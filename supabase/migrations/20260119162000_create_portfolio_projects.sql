-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- branding, web-design, social-media, 3d-modeling, video-editing
    client TEXT,
    tags TEXT[], -- Array of tags like ["UI/UX", "React", "Mobile"]
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    project_url TEXT, -- External link to live project
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON public.portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON public.portfolio_projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_active ON public.portfolio_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_order ON public.portfolio_projects(order_index);

-- Enable Row Level Security
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access to active projects
CREATE POLICY "Public can view active portfolio projects"
ON public.portfolio_projects FOR SELECT
USING (is_active = true);

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage portfolio projects"
ON public.portfolio_projects FOR ALL
USING (auth.role() = 'authenticated');

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for portfolio images bucket
CREATE POLICY "Public Access to Portfolio Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can update portfolio images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can delete portfolio images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-images');

-- Insert sample portfolio data
INSERT INTO public.portfolio_projects (title, description, category, client, tags, image_url, is_featured, is_active, order_index)
VALUES 
    ('TechVision Rebrand', 'Complete brand transformation for a tech startup, including new logo, guidelines, and website.', 'branding', 'TechVision Inc.', ARRAY['BRANDING', 'DESIGN', 'DEVELOPMENT'], 'https://images.unsplash.com/photo-1557683316-973673baf926', true, true, 1),
    ('EcoLife Campaign', 'Social media campaign that increased engagement by 300% across all platforms.', 'social-media', 'EcoLife', ARRAY['SOCIAL', 'CAMPAIGN', 'CONTENT'], 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', true, true, 2),
    ('NexGen 3D Product', 'Photorealistic 3D visualization for next-generation consumer electronics launch.', '3d-modeling', 'NexGen Electronics', ARRAY['3D ART', 'ANIMATION', 'PRODUCT'], 'https://images.unsplash.com/photo-1633356122544-f134324a6cee', true, true, 3),
    ('Artistry Portfolio', 'Modern portfolio website for a digital artist with interactive UI elements.', 'web-design', 'Sarah Johnson', ARRAY['WEB DESIGN', 'DEVELOPMENT', 'UI/UX'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', true, true, 4),
    ('Future Finance App', 'Clean, intuitive UI/UX design for a fintech platform with complex workflows.', 'web-design', 'Future Finance', ARRAY['UI/UX', 'FIGMA', 'MOBILE'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', false, true, 5),
    ('Neon Nights', 'Cinematic video editing and color grading for a music video production.', 'video-editing', 'Neon Records', ARRAY['VIDEO EDITING', 'MOTION', 'COLOR'], 'https://images.unsplash.com/photo-1514306191717-452ec28c7814', false, true, 6)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION update_portfolio_updated_at();

COMMENT ON TABLE public.portfolio_projects IS 'Portfolio projects showcase for the website';
COMMENT ON COLUMN public.portfolio_projects.category IS 'Project category: branding, web-design, social-media, 3d-modeling, video-editing';
COMMENT ON COLUMN public.portfolio_projects.is_featured IS 'Whether to show in featured/selected works section on homepage';
COMMENT ON COLUMN public.portfolio_projects.order_index IS 'Display order (lower numbers appear first)';
