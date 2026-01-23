-- MS DigiMark Blog System Expansion
-- Target: ogeqzcluyafngfobsrqw

-- Add font_family column
ALTER TABLE articles ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'sans';

-- Ensure existing columns exist (safety)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'purple';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'MS DigiMark Team';
