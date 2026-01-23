-- =====================================================
-- ATS (APPLICANT TRACKING SYSTEM) ENHANCEMENTS
-- Add notes, scoring, and pipeline management
-- =====================================================

-- Add ATS fields to job_applications table
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS ats_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;

-- Create application_notes table for tracking communication history
CREATE TABLE IF NOT EXISTS application_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    note_type VARCHAR(50) DEFAULT 'general' -- general, interview, email, call
);

-- Create indexes for better ATS performance
CREATE INDEX IF NOT EXISTS idx_applications_score ON job_applications(ats_score DESC);
CREATE INDEX IF NOT EXISTS idx_applications_starred ON job_applications(starred);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_interview ON job_applications(interview_date);
CREATE INDEX IF NOT EXISTS idx_application_notes_app_id ON application_notes(application_id);

-- Add trigger to update reviewed_at when status changes
CREATE OR REPLACE FUNCTION update_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        NEW.reviewed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reviewed_at ON job_applications;
CREATE TRIGGER trigger_update_reviewed_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_reviewed_at();

-- RLS policies for notes
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can manage notes" ON application_notes;
DROP POLICY IF EXISTS "Anyone can add notes" ON application_notes;
DROP POLICY IF EXISTS "Anyone can view notes" ON application_notes;

-- Admin can do everything with notes
CREATE POLICY "Admin can manage notes"
ON application_notes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public to insert notes (for now - we'll tighten security later)
CREATE POLICY "Anyone can add notes"
ON application_notes
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public to view notes (for now - we'll tighten security later)
CREATE POLICY "Anyone can view notes"
ON application_notes
FOR SELECT
TO anon
USING (true);

-- Comments
COMMENT ON COLUMN job_applications.ats_score IS 'Automated score based on keyword matching (0-100)';
COMMENT ON COLUMN job_applications.admin_notes IS 'Internal notes visible only to admins';
COMMENT ON COLUMN job_applications.interview_date IS 'Scheduled interview date and time';
COMMENT ON COLUMN job_applications.tags IS 'Tags for categorization (e.g., urgent, top-candidate)';
COMMENT ON COLUMN job_applications.source IS 'Application source (website, referral, linkedin)';
COMMENT ON COLUMN job_applications.starred IS 'Mark important applications';
COMMENT ON COLUMN job_applications.last_contacted_at IS 'Last time candidate was contacted';
