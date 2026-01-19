-- Migration to update reels to support multi-page assignment
-- Corrected version to handle default value casting issues

-- 1. Remove the existing default constraint
ALTER TABLE public.reels ALTER COLUMN page_section DROP DEFAULT;

-- 2. Convert the column to text array
ALTER TABLE public.reels 
ALTER COLUMN page_section SET DATA TYPE TEXT[] 
USING ARRAY[page_section];

-- 3. Set the new array-based default
ALTER TABLE public.reels 
ALTER COLUMN page_section SET DEFAULT ARRAY['home'];
