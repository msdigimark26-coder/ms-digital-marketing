-- Migration to enhance portal_users for Digital ID Card System
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS id_card_status TEXT DEFAULT 'Active';
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false;
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS id_card_issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing main admin with some dummy data if missing
UPDATE portal_users 
SET 
  full_name = 'Britto Selvan Raj',
  employee_id = 'ID0345',
  department = 'Development',
  id_card_status = 'Active',
  biometric_enabled = true
WHERE username = 'msdigimark' AND employee_id IS NULL;
