-- Quick fix: Add cover_image_url column to existing employees table
-- Run this in Supabase SQL Editor

-- Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'employees' 
        AND column_name = 'cover_image_url'
    ) THEN
        ALTER TABLE employees ADD COLUMN cover_image_url TEXT;
        RAISE NOTICE 'Column cover_image_url added successfully';
    ELSE
        RAISE NOTICE 'Column cover_image_url already exists';
    END IF;
END $$;
