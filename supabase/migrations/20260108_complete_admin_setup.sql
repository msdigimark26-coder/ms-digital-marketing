-- 1. Create ADMIN_LOGIN_LOGS table
CREATE TABLE IF NOT EXISTS admin_login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES portal_users(id),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    logout_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL, -- 'success', 'failed', 'pending_face_auth'
    captured_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for logs
ALTER TABLE admin_login_logs ENABLE ROW LEVEL SECURITY;

-- Allow public access (needed for login flow before session is fully established)
CREATE POLICY "Enable read access for all users" ON admin_login_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON admin_login_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON admin_login_logs FOR UPDATE USING (true);

-- 2. Create ADMIN_MESSAGES table
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES portal_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON admin_messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON admin_messages FOR INSERT WITH CHECK (true);

-- 3. Create STORAGE BUCKET for admin logs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin_logs', 'admin_logs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Allow public uploads to admin_logs" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'admin_logs' );

CREATE POLICY "Allow public select from admin_logs" ON storage.objects
FOR SELECT USING ( bucket_id = 'admin_logs' );

-- 4. Update PORTAL_USERS with ROLE column
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
UPDATE portal_users SET role = 'admin' WHERE role IS NULL;

-- 5. Optional: Set a specific user as super_admin if needed
-- UPDATE portal_users SET role = 'super_admin' WHERE username = 'admin'; 
