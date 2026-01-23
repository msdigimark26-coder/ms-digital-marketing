import { createClient } from '@supabase/supabase-js';

// Third Supabase Account - Dedicated to Careers/Job Management
const careersSupabaseUrl = import.meta.env.VITE_CAREERS_SUPABASE_URL || '';
const careersSupabaseKey = import.meta.env.VITE_CAREERS_SUPABASE_KEY || '';

// Check if careers Supabase is properly configured
export const isCareersSupabaseConfigured = Boolean(
    careersSupabaseUrl &&
    careersSupabaseKey &&
    careersSupabaseUrl.startsWith('https://') &&
    careersSupabaseKey.length > 20
);

// Create the Supabase client for careers management
export const careersSupabase = createClient(careersSupabaseUrl, careersSupabaseKey, {
    auth: {
        persistSession: false, // We'll use the main auth system
    },
    global: {
        headers: {
            'x-application-name': 'ms-digimark-careers',
        },
    },
});

// Type definitions for careers system
export interface JobOpening {
    id: string;
    title: string;
    department: string;
    focus_areas: string[];
    description: string;
    requirements: string;
    experience_level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
    location: 'Remote' | 'Onsite' | 'Hybrid';
    job_type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
    status: 'Active' | 'Inactive' | 'Closed';
    salary_range?: string;
    created_at: string;
    updated_at: string;
}

export interface JobApplication {
    id: string;
    job_opening_id: string;
    full_name: string;
    email: string;
    phone: string;
    resume_url: string;
    portfolio_url?: string;
    cover_letter?: string;
    status: 'Applied' | 'Reviewed' | 'Shortlisted' | 'Interviewed' | 'Rejected' | 'Hired';
    applied_at: string;
    reviewed_at?: string;
    notes?: string;
}

export interface PaymentEvidence {
    id: string;
    payer_name: string;
    amount: string;
    transaction_id: string;
    screenshot_url: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    created_at: string;
}

export interface Certification {
    id: string;
    title: string;
    issuer: string;
    logo_url: string;
    certificate_image_url?: string;
    verification_link?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SiteSection {
    section_key: string;
    is_visible: boolean;
    updated_at: string;
}

