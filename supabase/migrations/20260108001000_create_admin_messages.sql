CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES portal_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON admin_messages
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON admin_messages
    FOR INSERT WITH CHECK (true);
