-- Add gradient color support to services_showcase
ALTER TABLE public.services_showcase
ADD COLUMN IF NOT EXISTS use_gradient BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS gradient_preset TEXT,
ADD COLUMN IF NOT EXISTS gradient_start_color TEXT,
ADD COLUMN IF NOT EXISTS gradient_end_color TEXT;

COMMENT ON COLUMN public.services_showcase.use_gradient IS 'Whether to use gradient (true) or solid color (false)';
COMMENT ON COLUMN public.services_showcase.gradient_preset IS 'Preset gradient name (e.g., sunset, ocean, galaxy)';
COMMENT ON COLUMN public.services_showcase.gradient_start_color IS 'Custom gradient start color hex';
COMMENT ON COLUMN public.services_showcase.gradient_end_color IS 'Custom gradient end color hex';

-- Update existing records to use gradients by default
UPDATE public.services_showcase 
SET use_gradient = true,
    gradient_preset = icon_color
WHERE use_gradient IS NULL;
