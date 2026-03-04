-- Create Site Settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert right click blocking setting
INSERT INTO public.site_settings (key, value, description)
VALUES ('content_protection_enabled', 'false', 'Enable/Disable right-click and content protection')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public can view settings') THEN
        CREATE POLICY "Public can view settings" ON public.site_settings
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage settings') THEN
        CREATE POLICY "Admins can manage settings" ON public.site_settings
            FOR ALL USING (true);
    END IF;
END $$;

-- Grant access
GRANT ALL ON public.site_settings TO anon;
GRANT ALL ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
