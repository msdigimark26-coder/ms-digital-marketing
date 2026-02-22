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

-- Insert dummy data so it's not empty Initially
INSERT INTO public.admin_activity_logs (admin_name, admin_email, action_type, target_type, target_id, description, ip_address, user_agent) VALUES
('msdigimark', 'msdigimark@example.com', 'create', 'portfolio_projects', 'uuid-placeholder', 'Added new project: TechVision Rebrand', '192.168.1.1', 'Mozilla/5.0'),
('msdigimark', 'msdigimark@example.com', 'update', 'services', 'uuid-placeholder', 'Updated SEO Services pricing', '192.168.1.1', 'Mozilla/5.0');
