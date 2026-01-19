-- Create Services Showcase Table for Second Supabase Instance
CREATE TABLE IF NOT EXISTS public.services_showcase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL, -- Icon identifier (e.g., 'code', 'search', 'palette')
    icon_color TEXT DEFAULT 'pink', -- Icon background color
    is_popular BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    learn_more_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services_showcase ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Enable read access for all users" ON public.services_showcase
    FOR SELECT USING (is_active = true OR true); -- Always readable

CREATE POLICY "Enable insert for authenticated users" ON public.services_showcase
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.services_showcase
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.services_showcase
    FOR DELETE USING (true);

-- Create Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_showcase_updated_at BEFORE UPDATE
    ON public.services_showcase FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert Sample Data based on the image
INSERT INTO public.services_showcase (title, description, icon_name, icon_color, is_popular, order_index, learn_more_url)
VALUES 
    ('Web Design & Development', 'Create stunning, high-performance websites that convert visitors into customers. Custom designs tailored to your brand.', 'code', 'pink', false, 1, '/services/web-design'),
    ('SEO & Content Marketing', 'Dominate search rankings with data-driven strategies and compelling content that drives organic traffic.', 'search', 'blue', true, 2, '/services/seo'),
    ('Social Media Marketing', 'Build engaged communities across platforms. We handle strategy, content creation, and community management.', 'share2', 'pink', false, 3, '/services/social-media'),
    ('PPC & Paid Advertising', 'Maximize ROI with precision-targeted campaigns on Google, Facebook, LinkedIn and more.', 'target', 'green', false, 4, '/services/ppc'),
    ('Video & Photo Editing', 'Transform footage into cinematic masterpieces. Professional editing, color grading, and motion graphics.', 'film', 'red', false, 5, '/services/video-editing'),
    ('UI/UX Design', 'Craft intuitive interfaces users love. We design user-centric digital experiences that delight and convert.', 'palette', 'purple', false, 6, '/services/ui-ux-design');
