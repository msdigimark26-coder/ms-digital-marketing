ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
-- Update existing rows if any to have default 'admin'
UPDATE portal_users SET role = 'admin' WHERE role IS NULL;
