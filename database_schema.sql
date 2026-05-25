-- =========================================================================
-- MILVEXA SOLUTIONS PVT. LTD. - CORPORATE WEBSITE DATABASE SCHEMA
-- =========================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard (https://supabase.com).
-- 2. Go to the "SQL Editor" section in the left sidebar.
-- 3. Click on "New query", paste the entire contents of this file, and click "Run".
-- =========================================================================

-- 1. Enable UUID Extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COMPANY PROFILE TABLE
CREATE TABLE IF NOT EXISTS company_profile (
    id UUID PRIMARY KEY DEFAULT 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid, -- Static ID for unified profile row
    company_name TEXT NOT NULL DEFAULT 'Milvexa Solutions Pvt. Ltd.',
    tagline TEXT NOT NULL DEFAULT 'Innovative Software & Mobile App Solutions',
    description TEXT NOT NULL DEFAULT 'We build powerful Android apps, web applications, admin panels, and business solutions that help enterprises grow and automate their business efficiently.',
    years_experience INT NOT NULL DEFAULT 5,
    projects_completed INT NOT NULL DEFAULT 50,
    client_satisfaction TEXT NOT NULL DEFAULT '100%',
    support_hours TEXT NOT NULL DEFAULT '24/7',
    contact_email TEXT NOT NULL DEFAULT 'support@milvexasolutions.in',
    contact_phone TEXT NOT NULL DEFAULT '+91 96247 45944',
    address TEXT NOT NULL DEFAULT 'Anand, Gujarat, India',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CORPORATE SERVICES TABLE
CREATE TABLE IF NOT EXISTS corporate_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Smartphone',
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CORPORATE PROJECTS SHOWCASE TABLE
CREATE TABLE IF NOT EXISTS corporate_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Web Application',
    technologies TEXT[] NOT NULL DEFAULT '{}',
    short_description TEXT NOT NULL,
    long_description TEXT,
    image_url TEXT,
    live_url TEXT DEFAULT '#',
    github_url TEXT DEFAULT '#',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CORPORATE APK DOWNLOADS TABLE
CREATE TABLE IF NOT EXISTS corporate_apks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name TEXT NOT NULL,
    version TEXT NOT NULL,
    file_size TEXT NOT NULL,
    download_url TEXT NOT NULL,
    icon_type TEXT NOT NULL DEFAULT 'smartphone',
    release_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONTACT QUERY LEADS TABLE
CREATE TABLE IF NOT EXISTS contact_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- INITIAL SEED DATA (Pre-populates your website with exact layout data)
-- =========================================================================

-- Seed Company Profile (Ignores duplicate to prevent overriding customized fields)
INSERT INTO company_profile (id, company_name, tagline, description, years_experience, projects_completed, client_satisfaction, support_hours, contact_email, contact_phone, address)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid,
    'Milvexa Solutions Pvt. Ltd.',
    'Innovative Software & Mobile App Solutions',
    'We build powerful Android apps, web applications, admin panels, and business solutions that help enterprises grow and automate their business efficiently.',
    5,
    50,
    '100%',
    '24/7',
    'support@milvexasolutions.in',
    '+91 96247 45944',
    'Anand, Gujarat, India'
) ON CONFLICT (id) DO NOTHING;

-- Seed Services
INSERT INTO corporate_services (title, icon_name, description) VALUES
('Android App Development', 'Smartphone', 'High performance and feature-rich Android applications tailored for smartphones and enterprise tablets.'),
('Website Development', 'Globe', 'Modern, responsive, secure, and fast websites optimized for excellent user experience and performance.'),
('Admin Panel Systems', 'Database', 'Powerful admin dashboards and internal management portals to track operational data, roles, and records.'),
('Cloud & API Integration', 'Cpu', 'Secure cloud server architecture and robust API connectivity to synchronize your backend services smoothly.'),
('Business Automation', 'Workflow', 'Automate manual workflow cycles, data logging, analytics report generation, and enhance team productivity.'),
('Custom Software Development', 'Layers', 'Tailor-made software architectures built specifically to address the unique bottlenecks of your business model.')
ON CONFLICT DO NOTHING;

-- Seed Projects
INSERT INTO corporate_projects (title, category, technologies, short_description, long_description, image_url, live_url, github_url) VALUES
(
    'Cattle Farm Management System',
    'Web Application & Mobile Sync',
    ARRAY['React', 'Node.js', 'Supabase', 'Capacitor', 'Chart.js'],
    'Complete enterprise solution for cattle farm management, live health metrics tracking, milk production stats, breeding logs, and financial ledger bookkeeping.',
    'A fully integrated multi-tenant ERP software suite designed for modern dairy farm owners. Tracks daily herd activities, automated calf life-cycle promotion rules, precise milk volume metrics, veterinarian ledger summaries, staff payroll registers, supplier purchase records, and generates balance sheets. Enabled with multi-language i18n support.',
    'https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/cattel.png',
    'https://www.app.milvexasolutions.in',
    '#'
),
(
    'Billing Software & Invoice Desk',
    'Web Dashboard',
    ARRAY['React', 'PostgreSQL', 'TailwindCSS', 'PDF Generator'],
    'Smart, robust web billing panels. Tracks transactions, issues PDF invoices instantly, keeps tax summaries, and produces monthly balance records.',
    'High-speed business billing application designed to streamline customer checkouts. Features barcode scanner integration, print receipt configuration, tax ledger reports, custom supplier transactions history, and quick backup logs.',
    'https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/billing.png',
    '#',
    '#'
)
ON CONFLICT DO NOTHING;

-- Seed APKs
INSERT INTO corporate_apks (app_name, version, file_size, download_url, icon_type, release_date) VALUES
('Cattle Farm App', '1.1.1', '25.4 MB', 'https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/milvexa_v1.1.1.apk', 'dog', '20 May 2026'),
('Billing App', '2.1.0', '18.7 MB', '#', 'wallet', '18 May 2026'),
('Attendance App', '1.2.0', '16.2 MB', '#', 'briefcase', '10 May 2026'),
('Inventory App', '1.0.6', '22.8 MB', '#', 'package', '05 May 2026')
ON CONFLICT DO NOTHING;
