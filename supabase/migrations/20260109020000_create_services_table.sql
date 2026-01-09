-- Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'marketing',
    price TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read, Admin Write - assuming auth for now lets be permissive like others)
CREATE POLICY "Enable read access for all users" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.services
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.services
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.services
    FOR DELETE USING (true);

-- Insert Sample Data
INSERT INTO public.services (title, description, category, price)
VALUES 
    ('SEO Optimization', 'Improve your website ranking on Google with our advanced SEO strategies.', 'Marketing', '$500 - $1,500'),
    ('Social Media Management', 'Engage your audience and grow your brand across all social platforms.', 'Social Media', '$300 - $800'),
    ('Web Development', 'Custom website design and development tailored to your business needs.', 'Development', '$1,000 - $5,000');
