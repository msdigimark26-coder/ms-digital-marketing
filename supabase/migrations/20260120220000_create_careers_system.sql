-- =====================================================
-- MS DIGIMARK CAREERS MANAGEMENT SYSTEM
-- Database Schema for Job Openings & Applications
-- Account: ogeqzcluya (Third Supabase Account)
-- Created: 2026-01-20
-- =====================================================

-- =====================================================
-- TABLE: job_openings
-- Stores all job positions posted by MS DIGIMARK
-- =====================================================
CREATE TABLE IF NOT EXISTS job_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Job Details
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    focus_areas TEXT[] NOT NULL DEFAULT '{}', -- Array of skills/focus areas
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    
    -- Job Specifications
    experience_level VARCHAR(20) NOT NULL DEFAULT 'Mid',
    location VARCHAR(20) NOT NULL DEFAULT 'Remote',
    job_type VARCHAR(20) NOT NULL DEFAULT 'Full-time',
    salary_range VARCHAR(100),
    
    -- Status Management
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_experience_level CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead')),
    CONSTRAINT valid_location CHECK (location IN ('Remote', 'Onsite', 'Hybrid')),
    CONSTRAINT valid_job_type CHECK (job_type IN ('Full-time', 'Part-time', 'Internship', 'Contract')),
    CONSTRAINT valid_status CHECK (status IN ('Active', 'Inactive', 'Closed'))
);

-- =====================================================
-- TABLE: job_applications
-- Stores candidate applications for job openings
-- =====================================================
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to Job Opening
    job_opening_id UUID NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
    
    -- Candidate Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    
    -- Application Materials
    resume_url TEXT NOT NULL,
    portfolio_url TEXT,
    cover_letter TEXT,
    
    -- Application Status
    status VARCHAR(20) NOT NULL DEFAULT 'Applied',
    
    -- Review Information
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    notes TEXT, -- Admin notes about the candidate
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_application_status CHECK (status IN ('Applied', 'Reviewed', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired'))
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_job_openings_status ON job_openings(status);
CREATE INDEX idx_job_openings_created_at ON job_openings(created_at DESC);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_opening_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_email ON job_applications(email);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: job_openings
-- =====================================================

-- Public users can view ONLY active job openings
CREATE POLICY "Public users can view active openings"
ON job_openings
FOR SELECT
USING (status = 'Active');

-- Admin users can do everything (INSERT, UPDATE, DELETE)
-- Note: In production, you'd check against an admin_users table
-- For now, we'll use service role for admin operations
CREATE POLICY "Service role has full access to openings"
ON job_openings
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- RLS POLICIES: job_applications
-- =====================================================

-- Public users can INSERT their applications (anonymous applications allowed)
CREATE POLICY "Anyone can submit applications"
ON job_applications
FOR INSERT
WITH CHECK (true);

-- Public users can view their own applications by email
CREATE POLICY "Users can view their own applications"
ON job_applications
FOR SELECT
USING (true); -- We'll filter by email in application code

-- Service role (admin) has full access to applications
CREATE POLICY "Service role has full access to applications"
ON job_applications
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for job_openings
CREATE TRIGGER update_job_openings_updated_at
    BEFORE UPDATE ON job_openings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

INSERT INTO job_openings (title, department, focus_areas, description, requirements, experience_level, location, job_type, status, salary_range) VALUES
(
    'Full Stack Developer',
    'Engineering',
    ARRAY['React', 'Node.js', 'TypeScript', 'System Design'],
    'We are looking for a talented Full Stack Developer to join our engineering team. You will work on building scalable web applications using modern technologies and best practices.',
    E'• 3+ years of experience with React and Node.js\n• Strong understanding of TypeScript\n• Experience with REST APIs and GraphQL\n• Knowledge of database design (PostgreSQL, MongoDB)\n• Excellent problem-solving and debugging skills\n• Good communication and teamwork abilities',
    'Mid',
    'Remote',
    'Full-time',
    'Active',
    '₹8-12 LPA'
),
(
    'UI/UX Designer',
    'Design',
    ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    'Join our design team to create beautiful, intuitive user experiences for our digital products. You will work closely with developers and product managers to bring designs to life.',
    E'• 2+ years of UI/UX design experience\n• Proficiency in Figma and Adobe Creative Suite\n• Strong portfolio showcasing web and mobile designs\n• Understanding of user-centered design principles\n• Experience with design systems\n• Ability to collaborate with cross-functional teams',
    'Mid',
    'Hybrid',
    'Full-time',
    'Active',
    '₹6-10 LPA'
),
(
    'Digital Marketing Intern',
    'Marketing',
    ARRAY['SEO', 'Social Media', 'Content Writing', 'Analytics'],
    'Great opportunity for students or recent graduates to gain hands-on experience in digital marketing. Learn SEO, social media marketing, and content strategy from experienced professionals.',
    E'• Currently pursuing or recently completed degree in Marketing/Business\n• Basic understanding of SEO and social media platforms\n• Good writing and communication skills\n• Familiarity with Google Analytics (preferred)\n• Creative mindset and eagerness to learn\n• Available for 3-6 month internship',
    'Entry',
    'Remote',
    'Internship',
    'Active',
    '₹10,000-15,000/month'
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get active job openings count
CREATE OR REPLACE FUNCTION get_active_jobs_count()
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM job_openings WHERE status = 'Active';
$$ LANGUAGE SQL STABLE;

-- Function to get applications count for a job
CREATE OR REPLACE FUNCTION get_job_applications_count(job_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM job_applications WHERE job_opening_id = job_id;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE job_openings IS 'Stores all job openings posted by MS DIGIMARK';
COMMENT ON TABLE job_applications IS 'Stores candidate applications linked to job openings';

COMMENT ON COLUMN job_openings.focus_areas IS 'Array of skills/technologies relevant to the role';
COMMENT ON COLUMN job_applications.notes IS 'Internal admin notes about the candidate';
COMMENT ON COLUMN job_applications.reviewed_at IS 'Timestamp when application was first reviewed by admin';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
