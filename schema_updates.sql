-- ==========================================
-- MILVEXA SYSTEM UPDATES SCHEMA
-- ==========================================

-- 1. Create the SYSTEM_UPDATES table
CREATE TABLE IF NOT EXISTS system_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latest_version TEXT NOT NULL,
    release_notes TEXT,
    download_link TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    global_announcement TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert a default row so we always have exactly one config row
INSERT INTO system_updates (id, latest_version, release_notes, download_link, is_mandatory, global_announcement)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.0.0', 'Initial release', 'https://milvexa.in/download', false, ''
WHERE NOT EXISTS (
    SELECT id FROM system_updates WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- 3. Row Level Security (RLS)
ALTER TABLE system_updates ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (including anonymous users and unauthenticated app launches) to read the updates
DROP POLICY IF EXISTS "Public Read Updates" ON system_updates;
CREATE POLICY "Public Read Updates" ON system_updates FOR SELECT USING (true);

-- Allow authenticated users to manage the updates (Ideally just admins, but we'll use auth.uid() for simplicity as of now)
DROP POLICY IF EXISTS "Manage Updates" ON system_updates;
CREATE POLICY "Manage Updates" ON system_updates FOR ALL USING (auth.uid() IS NOT NULL);
