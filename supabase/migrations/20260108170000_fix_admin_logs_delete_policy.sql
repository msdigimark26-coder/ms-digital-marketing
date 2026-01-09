-- Enable delete policy for admin_login_logs table
CREATE POLICY "Enable delete for all users" ON admin_login_logs
    FOR DELETE USING (true);
