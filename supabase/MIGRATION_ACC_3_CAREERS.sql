-- MS DigiMark - ACCOUNT 3 (CAREERS & BLOG)
-- Project: ogeqzcluyafngfobsrqw (Marketing Content)
-- Purpose: Careers, Blog, Site Content Settings

-- 1. BLOG SYSTEM
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    cover_image TEXT,
    author TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. SITE SECTIONS (Visibility & Toggles)
CREATE TABLE IF NOT EXISTS public.site_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT UNIQUE,
    section_name TEXT,
    is_visible BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. CAREERS / ATS
CREATE TABLE IF NOT EXISTS public.job_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    type TEXT DEFAULT 'Full-time',
    description TEXT,
    requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.job_openings(id) ON DELETE CASCADE,
    applicant_name TEXT,
    applicant_email TEXT,
    phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'applied',
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer TEXT,
    verification_link TEXT,
    logo_url TEXT,
    certificate_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. APPLICANT PAYMENTS (Optional/Evidence)
CREATE TABLE IF NOT EXISTS public.applicant_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    amount DECIMAL,
    status TEXT DEFAULT 'pending',
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for ALL tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_payments ENABLE ROW LEVEL SECURITY;

-- 1. Public Content Policies (Read Only)
CREATE POLICY "Allow public select on articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Allow public select on jobs" ON public.job_openings FOR SELECT USING (true);
CREATE POLICY "Allow public select on certs" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Allow public select on site_sections" ON public.site_sections FOR SELECT USING (true);

-- 2. Career Application Policies (Insert Only)
CREATE POLICY "Allow public insert applications" ON public.job_applications FOR INSERT WITH CHECK (true);

-- 3. Admin Policies (Full Access)
CREATE POLICY "Allow admin all on articles" ON public.articles FOR ALL USING (true);
CREATE POLICY "Admin All Jobs" ON public.job_openings FOR ALL USING (true);
CREATE POLICY "Admin All Apps" ON public.job_applications FOR ALL USING (true);
CREATE POLICY "Admin All Certs" ON public.certifications FOR ALL USING (true);
CREATE POLICY "Admin All Sections" ON public.site_sections FOR ALL USING (true);
CREATE POLICY "Admin All Applicant Payments" ON public.applicant_payments FOR ALL USING (true);
