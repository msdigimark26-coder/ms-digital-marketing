-- 4. ADMIN ACTIVITY LOGS (Used in Audit Center)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name TEXT,
    admin_email TEXT,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    target_data JSONB,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow admin all on activity_logs
CREATE POLICY "Allow admin all on activity_logs" 
ON public.admin_activity_logs 
FOR ALL USING (true);
