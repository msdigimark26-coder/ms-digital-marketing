-- Create admin activity logs table to track all admin actions
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID, -- Store user ID but no foreign key constraint
    admin_email TEXT,
    admin_name TEXT,
    action_type TEXT NOT NULL, -- 'delete', 'update', 'create', 'status_change', etc.
    target_type TEXT NOT NULL, -- 'booking', 'lead', 'service', etc.
    target_id TEXT NOT NULL, -- ID of the deleted/modified record
    target_data JSONB, -- Store the full record data before deletion
    description TEXT, -- Human-readable description
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user ON public.admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON public.admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_type ON public.admin_activity_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.admin_activity_logs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.admin_activity_logs
    FOR INSERT WITH CHECK (true);

-- No update or delete allowed to maintain audit trail integrity
