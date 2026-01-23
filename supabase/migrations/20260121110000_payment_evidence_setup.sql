-- Migration to add Payment Evidence system to the 3rd Supabase Instance (Careers/Payments Instance)

-- 1. Create payment_evidence table
CREATE TABLE IF NOT EXISTS public.payment_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payer_name TEXT NOT NULL,
    amount TEXT NOT NULL,
    transaction_id TEXT NOT NULL UNIQUE,
    screenshot_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.payment_evidence ENABLE ROW LEVEL SECURITY;

-- 3. Create public policy for submissions (anyone can submit proof)
CREATE POLICY "Allow public submissions" ON public.payment_evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON public.payment_evidence FOR SELECT USING (true);

-- 4. Create storage bucket for payment screenshots
-- Note: This might need to be run in the SQL editor or created manually in Supabase Dashboard
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment_evidence', 'payment_evidence', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for screenshots
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment_evidence');

CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment_evidence');
