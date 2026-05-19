-- ==========================================
-- MILVEXA ADMIN ROLES & CUSTOM AUTH SCHEMA
-- ==========================================

-- 1. Create the ADMIN_ROLES table to whitelist emails and store custom passwords for Admin Panel access
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT, -- Plain text password for Super Admin visibility
    role TEXT CHECK (role IN ('super_admin', 'staff')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert the default Super Admin so they don't get locked out
INSERT INTO admin_roles (email, password, role, status)
SELECT 'milvexasolutions@gmail.com', 'admin@123', 'super_admin', 'active'
WHERE NOT EXISTS (
    SELECT email FROM admin_roles WHERE email = 'milvexasolutions@gmail.com'
);

-- 3. Row Level Security (RLS)
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Allow Public Read/Update (So the login page can verify passwords and staff can set them)
-- NOTE: Because passwords are in plain text and we bypass standard Auth, we keep policies open for the admin portal.
DROP POLICY IF EXISTS "Public Manage Admin Roles" ON admin_roles;
CREATE POLICY "Public Manage Admin Roles" ON admin_roles FOR ALL USING (true);
