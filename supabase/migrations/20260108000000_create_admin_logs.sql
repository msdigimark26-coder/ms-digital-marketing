CREATE TABLE IF NOT EXISTS admin_login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES portal_users(id),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    logout_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL, -- 'success', 'failed', 'pending_face_auth'
    captured_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add policy for admin access if RLS is enabled
ALTER TABLE admin_login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON admin_login_logs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON admin_login_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON admin_login_logs
    FOR UPDATE USING (true);
