import { createClient } from '@supabase/supabase-js';

// Connection to the NEW Reels-specific Supabase project
const REELS_SUPABASE_URL = import.meta.env.VITE_REELS_SUPABASE_URL || '';
const REELS_SUPABASE_ANON_KEY = import.meta.env.VITE_REELS_SUPABASE_ANON_KEY || '';

export const isReelsSupabaseConfigured = !!(REELS_SUPABASE_URL && REELS_SUPABASE_ANON_KEY);

// Create the specialized client
export const reelsSupabase = createClient(
    REELS_SUPABASE_URL || 'https://jhktcgzyfphywwxarrwm.supabase.co',
    REELS_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoa3RjZ3p5ZnBoeXd3eGFycndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzg5NzQsImV4cCI6MjA4NDc1NDk3NH0.94qTRDbM-gil5HtvUQ7hz19ssytQlxiZGuS155_rxcw',
    {
        auth: {
            persistSession: false
        }
    }
);
