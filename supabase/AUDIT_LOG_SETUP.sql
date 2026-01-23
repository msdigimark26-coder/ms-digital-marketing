-- FIXED VERSION - Run this in Supabase SQL Editor

-- Create admin activity logs table (NO foreign key constraint)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID,
    admin_email TEXT,
    admin_name TEXT,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_data JSONB,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user 
    ON public.admin_activity_logs(admin_user_id);
    
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type 
    ON public.admin_activity_logs(action_type);
    
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_type 
    ON public.admin_activity_logs(target_type);
    
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at 
    ON public.admin_activity_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read audit logs (for transparency)
CREATE POLICY "Enable read access for all users" 
    ON public.admin_activity_logs
    FOR SELECT 
    USING (true);

-- Allow anyone to insert audit logs
CREATE POLICY "Enable insert for all users" 
    ON public.admin_activity_logs
    FOR INSERT 
    WITH CHECK (true);

-- No update or delete policies (maintains audit integrity)
