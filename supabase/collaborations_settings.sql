-- ============================================================
-- Collaborations Settings Table (Reels Supabase - 4th Account)
-- Run this in: https://jhktcgzyfphywwxarrwm.supabase.co
-- SQL Editor → New Query → Paste & Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.collaborations_settings (
  id integer PRIMARY KEY DEFAULT 1,
  floating_mode TEXT DEFAULT 'auto' -- 'auto', 'always', 'never'
);

-- Insert default row
INSERT INTO public.collaborations_settings (id, floating_mode) VALUES (1, 'auto') ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.collaborations_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read on collaborations_settings"
  ON public.collaborations_settings FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update on collaborations_settings"
  ON public.collaborations_settings FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated insert on collaborations_settings"
  ON public.collaborations_settings FOR INSERT WITH CHECK (true);
