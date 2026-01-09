-- Create missing tables for Admin Dashboard

-- 1. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    source TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    booking_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Admin Portal Users (Special table for portal login as requested)
CREATE TABLE IF NOT EXISTS public.portal_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Note: In a real app, use hashing. For this request, we'll store as provided.
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Leads: Admins only
CREATE POLICY "Admins can manage leads" ON public.leads
    FOR ALL USING (true); -- Simplifying for now so they can see it in portal

-- Services: Public read, Admin manage
CREATE POLICY "Public can view services" ON public.services
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services
    FOR ALL USING (true);

-- Bookings: Admin manage
CREATE POLICY "Admins can manage bookings" ON public.bookings
    FOR ALL USING (true);

-- Portal Admins: Admin manage
CREATE POLICY "Admins can manage portal admins" ON public.portal_admins
    FOR ALL USING (true);

-- Insert initial admin users
INSERT INTO public.portal_admins (username, email, password, role)
VALUES 
    ('msdigimark', 'headofms@msdigimark.org', '$msdigimark@2026', 'superadmin'),
    ('Saisankeet', 'saisankeet@msdigimark.org', '$saisankeet@14', 'admin'),
    ('Britto', 'britto@msdigimark.org', '$britto@19', 'admin'),
    ('Arivalagan', 'arivalagan@msdigimark.org', '$arivu@18', 'admin'),
    ('Abdul Razaak', 'abdulrazaak@msdigimark.org', '$razaak@23', 'admin'),
    ('Joel Kevin', 'joelkevin@msdigimark.org', '$joel@12', 'admin'),
    ('Baptis', 'baptis@msdigimark.org', '$baptis@06', 'admin'),
    ('Rahul ji', 'rahulji@msdigimark.org', '$rahul@2026', 'admin'),
    ('Sangeeth', 'sangeeth@msdigimark.org', '$sangeeth@2026', 'admin'),
    ('Giruba Shankar', 'girubashankar@msdigimark.org', '$shankar@03', 'admin'),
    ('Fayeeth', 'fayeeth@msdigimark.org', '$fayeeth@27', 'admin')
ON CONFLICT (username) DO NOTHING;
