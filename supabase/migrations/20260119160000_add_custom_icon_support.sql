-- Add custom icon support to services_showcase
ALTER TABLE public.services_showcase
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS use_custom_icon BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_icon_color TEXT;

-- Update existing records to use default values
UPDATE public.services_showcase 
SET use_custom_icon = false 
WHERE use_custom_icon IS NULL;

COMMENT ON COLUMN public.services_showcase.icon_url IS 'URL to custom uploaded icon image';
COMMENT ON COLUMN public.services_showcase.use_custom_icon IS 'Whether to use custom icon (true) or preset icon (false)';
COMMENT ON COLUMN public.services_showcase.custom_icon_color IS 'Custom hex color for icon background (e.g., #FF5733)';

-- Create storage bucket for service icons
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-icons', 'service-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for service icons bucket
CREATE POLICY "Public Access to Service Icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-icons');

CREATE POLICY "Authenticated users can upload service icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'service-icons');

CREATE POLICY "Authenticated users can update service icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'service-icons');

CREATE POLICY "Authenticated users can delete service icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'service-icons');
