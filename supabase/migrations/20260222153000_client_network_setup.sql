-- Create table for global clientele network locations
-- Target: 4th Supabase Account (reels/specialized)
CREATE TABLE IF NOT EXISTS client_network_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    x_position FLOAT NOT NULL, -- percentage 0-100 on the map
    y_position FLOAT NOT NULL, -- percentage 0-100 on the map
    connection_id UUID REFERENCES client_network_locations(id) ON DELETE SET NULL, -- Optional connection to another node
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_network_locations ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Public read access
CREATE POLICY "Public Read Access" ON client_network_locations
    FOR SELECT USING (true);

-- Admin CRUD access 
-- Note: Since this is a secondary account (4th), we match the pattern of other secondary accounts
-- and allow full access for the API client used in the admin portal.
CREATE POLICY "Admin Full Access" ON client_network_locations
    FOR ALL USING (true) WITH CHECK (true);

-- Add sample data
INSERT INTO client_network_locations (name, x_position, y_position) VALUES
('Alaska', 5, 20),
('Los Angeles', 15, 35),
('Brasília', 35, 80),
('Lisbon', 45, 40),
('London', 52, 30),
('Nairobi', 65, 75),
('New Delhi', 75, 45),
('Vladivostok', 90, 35);
