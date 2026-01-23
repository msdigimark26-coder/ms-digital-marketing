-- Add budget and service_name columns to bookings table

-- Add service_name column (to store service as text instead of foreign key)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS service_name TEXT;

-- Add budget column
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS budget TEXT;

-- Update existing records to have null values (safe migration)
-- No data migration needed since this is a new feature
