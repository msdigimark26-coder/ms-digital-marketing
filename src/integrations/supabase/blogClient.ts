import { createClient } from '@supabase/supabase-js';

// Project: ogeqzcluyafngfobsrqw (Connected to Blog System as requested)
const blogSupabaseUrl = import.meta.env.VITE_CAREERS_SUPABASE_URL || '';
const blogSupabaseKey = import.meta.env.VITE_CAREERS_SUPABASE_KEY || '';

// Create the dedicated client for Blog data
export const blogSupabase = createClient(blogSupabaseUrl, blogSupabaseKey, {
    auth: {
        persistSession: false,
    }
});
