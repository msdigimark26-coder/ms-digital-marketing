-- Add cover_image_url column to existing employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN employees.cover_image_url IS 'URL to the employee cover/background image (optional)';
