-- 1. Update ADMIN_MESSAGES table to support files
ALTER TABLE admin_messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- 2. Create STORAGE BUCKET for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('chat_attachments', 'chat_attachments', true, 20971520, null) -- 20MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for chat
CREATE POLICY "Allow public uploads to chat_attachments" ON storage.objects
FOR INSERT WITH CHECK ( bucket_id = 'chat_attachments' );

CREATE POLICY "Allow public select from chat_attachments" ON storage.objects
FOR SELECT USING ( bucket_id = 'chat_attachments' );

-- 3. Function to delete old messages (can be called via RPC if cron not available, 
--    or set up as a scheduled task in Supabase dashboard)
CREATE OR REPLACE FUNCTION delete_old_admin_messages()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM admin_messages
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;
