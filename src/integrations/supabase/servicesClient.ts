// Secondary Supabase Client for Services Showcase
import { createClient } from '@supabase/supabase-js';

const SERVICES_SUPABASE_URL = import.meta.env.VITE_SERVICES_SUPABASE_URL || '';
const SERVICES_SUPABASE_KEY = import.meta.env.VITE_SERVICES_SUPABASE_KEY || '';

// Create a mock client for development
const createMockClient = () => {
    const mockDeduction: any = {
        eq: () => mockDeduction,
        select: () => mockDeduction,
        order: () => mockDeduction,
        limit: () => mockDeduction,
        single: () => mockDeduction,
        insert: () => mockDeduction,
        update: () => mockDeduction,
        delete: () => mockDeduction,
        or: () => mockDeduction,
        match: () => mockDeduction,
        in: () => mockDeduction,
        contains: () => mockDeduction,
        range: () => mockDeduction,
        then: (resolve: any) => resolve({ data: [], error: null }),
        catch: (reject: any) => {
            if (typeof reject === 'function') return reject(new Error('Services Supabase not configured'));
            return mockDeduction;
        },
    };

    return {
        from: () => mockDeduction,
        channel: () => ({
            on: () => ({
                subscribe: () => ({
                    unsubscribe: () => { }
                })
            }),
            subscribe: () => ({
                unsubscribe: () => { }
            })
        }),
        storage: {
            from: () => ({
                upload: () => Promise.resolve({ data: null, error: new Error('Services Supabase not configured') }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
                remove: () => Promise.resolve({ data: null, error: new Error('Services Supabase not configured') })
            })
        }
    };
};

const isConfigured = Boolean(
    SERVICES_SUPABASE_URL &&
    SERVICES_SUPABASE_KEY &&
    SERVICES_SUPABASE_URL !== 'https://placeholder.supabase.co'
);

if (!isConfigured) {
    console.warn('⚠️ SERVICES SUPABASE NOT CONFIGURED: Using mock client. Set VITE_SERVICES_SUPABASE_URL and VITE_SERVICES_SUPABASE_KEY in your .env file');
}

let client;
try {
    client = isConfigured
        ? createClient(SERVICES_SUPABASE_URL, SERVICES_SUPABASE_KEY, {
            auth: {
                persistSession: false,
            }
        })
        : createMockClient();
} catch (error) {
    console.error('Service Supabase init failed:', error);
    client = createMockClient();
}

export const servicesSupabase = client as any;

export const isServicesSupabaseConfigured = isConfigured;
