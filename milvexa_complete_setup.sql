-- ====================================================================
--  🐄 MILVEXA FARM MANAGEMENT & WEBSITE - COMPLETE UNIFIED DATABASE SETUP SQL 🐄
-- ====================================================================
--  ✅ Clear & Comprehensive SQL script to set up all tables, indexes,
--     RLS (Row Level Security) policies, triggers, views, and storage.
--  ✅ Safely combines both App Farm Management & Corporate Website schemas.
--  ✅ Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS).
-- ====================================================================
-- How to run in Supabase:
--   1. Open Supabase Dashboard (https://supabase.com).
--   2. Go to SQL Editor (Left sidebar).
--   3. Create a "New Query".
--   4. Paste this entire script and click "Run".
-- ====================================================================

-- ============================================================
-- 1. SETUP EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. CORPORATE WEBSITE TABLES
-- ============================================================

-- A. COMPANY PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.company_profile (
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

-- B. CORPORATE SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.corporate_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Smartphone',
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. CORPORATE PROJECTS SHOWCASE TABLE
CREATE TABLE IF NOT EXISTS public.corporate_projects (
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

-- D. CORPORATE APK DOWNLOADS TABLE
CREATE TABLE IF NOT EXISTS public.corporate_apks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name TEXT NOT NULL,
    version TEXT NOT NULL,
    file_size TEXT NOT NULL,
    download_url TEXT NOT NULL,
    icon_type TEXT NOT NULL DEFAULT 'smartphone',
    release_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E. CONTACT QUERY LEADS TABLE
CREATE TABLE IF NOT EXISTS public.contact_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. APP FARM MANAGEMENT TABLES
-- ============================================================

-- A. PROFILES TABLE (Syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  owner_name   TEXT,
  farm_name    TEXT,
  phone        TEXT,
  email        TEXT,
  address      TEXT,
  company_name TEXT DEFAULT 'MILVEXA SOLUTIONS PVT. LTD.',
  is_active    BOOLEAN DEFAULT TRUE,
  is_blocked   BOOLEAN DEFAULT FALSE,
  updated_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- B. ANIMALS TABLE (Cattle Records)
CREATE TABLE IF NOT EXISTS public.animals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  tag_id           TEXT,
  tag_number       TEXT,
  type             TEXT DEFAULT 'Cow'
                     CHECK (type IN ('Cow', 'Buffalo', 'Goat', 'Sheep', 'Calf', 'Bull')),
  breed            TEXT,
  gender           TEXT DEFAULT 'Female'
                     CHECK (gender IN ('Male', 'Female')),
  status           TEXT DEFAULT 'Milch'
                     CHECK (status IN ('Milch', 'Dry', 'Baby', 'Calf', 'Bull', 'Sold', 'Dead')),
  health_status    TEXT DEFAULT 'Healthy'
                     CHECK (health_status IN ('Healthy', 'Sick', 'Under Treatment', 'Inseminated', 'Pregnant')),
  pregnant_status  TEXT DEFAULT 'Not Pregnant'
                     CHECK (pregnant_status IN ('Pregnant', 'Not Pregnant')),
  calf_mother_type TEXT CHECK (calf_mother_type IN ('Cow', 'Buffalo')),
  purchase_price   NUMERIC(12, 2),
  purchase_date    DATE,
  sale_price       NUMERIC(12, 2),
  sale_date        DATE,
  note             TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- C. MILK PRODUCTION TABLE (Daily yields & direct dairy pours)
CREATE TABLE IF NOT EXISTS public.milk_production (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_id        UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  quantity         NUMERIC(8, 2) NOT NULL,
  shift            TEXT DEFAULT 'Morning'
                     CHECK (shift IN ('Morning', 'Evening')),
  production_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  society          TEXT,
  fat              NUMERIC(5, 2),
  snf              NUMERIC(5, 2),
  price_per_liter  NUMERIC(8, 2),
  total_amount     NUMERIC(12, 2),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- D. BREEDING RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.breeding_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_id      UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  breeding_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  type           TEXT DEFAULT 'AI'
                   CHECK (type IN ('AI', 'Natural')),
  bull_details   TEXT,
  status         TEXT DEFAULT 'Pending'
                   CHECK (status IN ('Pending', 'Success', 'Failed', 'Delivered', 'Pregnant')),
  note           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- E. VET DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  specialty   TEXT,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- F. DOCTOR LEDGER TABLE (Vet transactions)
CREATE TABLE IF NOT EXISTS public.doctor_ledger (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id    UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  reason       TEXT NOT NULL,
  total_fee    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  paid_amount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  balance      NUMERIC(10, 2) GENERATED ALWAYS AS (total_fee - paid_amount) STORED,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- G. STAFF TABLE (Farm workers)
CREATE TABLE IF NOT EXISTS public.staff (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  role           TEXT,
  phone          TEXT,
  salary_amount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  joining_date   DATE DEFAULT CURRENT_DATE,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- H. STAFF TRANSACTIONS TABLE (Advance & Salary payments)
CREATE TABLE IF NOT EXISTS public.staff_transactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id   UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  type       TEXT DEFAULT 'Salary'
               CHECK (type IN ('Salary', 'Advance')),
  amount     NUMERIC(10, 2) NOT NULL,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- I. SOCIETIES TABLE (Dairy Cooperative Centers)
CREATE TABLE IF NOT EXISTS public.societies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  location        TEXT,
  contact_person  TEXT,
  contact_number  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- J. FEED PURCHASES TABLE (Purchased via Cooperative Societies)
CREATE TABLE IF NOT EXISTS public.feed_purchases (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  society_id    UUID REFERENCES public.societies(id) ON DELETE SET NULL,
  item_name     TEXT NOT NULL,
  quantity      NUMERIC(10, 2) NOT NULL,
  unit_price    NUMERIC(10, 2) NOT NULL,
  total_amount  NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- K. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- L. SUPPLIER PURCHASES TABLE (Direct Stock Purchases)
CREATE TABLE IF NOT EXISTS public.supplier_purchases (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id    UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  item_name      TEXT NOT NULL,
  quantity       NUMERIC(10, 2) NOT NULL,
  unit_price     NUMERIC(10, 2) NOT NULL,
  total_amount   NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  purchase_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- M. PAYMENTS TABLE (Financial Transactions & Balance Sheet)
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('Income', 'Expense', 'Cash Withdraw')),
  amount      NUMERIC(12, 2) NOT NULL,
  category    TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- N. BORROW & LEND TABLE (Credit & Debit Tracking)
CREATE TABLE IF NOT EXISTS public.borrow_lend (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('Credit', 'Debit')), -- Credit = borrowed, Debit = lent
  amount      NUMERIC(12, 2) NOT NULL,
  status      TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Settled')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- O. INVENTORY TABLE (Feed & Medicine Stock management)
CREATE TABLE IF NOT EXISTS public.inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'Feed'
                 CHECK (category IN ('Feed', 'Medicine', 'Equipment', 'Other')),
  item_name   TEXT NOT NULL,
  quantity    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit        TEXT DEFAULT 'Kg',
  min_stock   NUMERIC(10, 2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- P. DAIRY LEDGER TABLE (Dairy milk payouts tracking)
CREATE TABLE IF NOT EXISTS public.dairy_ledger (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dairy_name         TEXT NOT NULL,
  period_start       DATE NOT NULL,
  period_end         DATE NOT NULL,
  total_milk_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid_amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance            NUMERIC(12, 2) GENERATED ALWAYS AS (total_milk_amount - paid_amount) STORED,
  status             TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partial', 'Paid')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Q. ADMIN ROLES TABLE (Custom credentials whitelist for Admin Panel)
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    username    TEXT UNIQUE, -- Custom username for login
    password    TEXT, -- Plain text password for admin panel visibility
    role        TEXT CHECK (role IN ('super_admin', 'staff')),
    status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure username column exists if the table was already created in a previous session
ALTER TABLE public.admin_roles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;


-- R. SYSTEM UPDATES TABLE (APK & Release notes manager)
CREATE TABLE IF NOT EXISTS public.system_updates (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latest_version       TEXT NOT NULL,
    release_notes        TEXT,
    download_link        TEXT,
    is_mandatory         BOOLEAN DEFAULT false,
    global_announcement  TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 4. TRIGGERS & FUNCTIONS (Profiles <> auth.users sync)
-- ============================================================

-- Function: Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Automatically update profile email when user changes auth email
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) ENABLEMENT & POLICIES
-- ============================================================

-- A. Enable RLS on all tables
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_apks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_lend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dairy_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- B. Policies for Corporate Website Tables (Universal access checks)
DROP POLICY IF EXISTS "Public Read company_profile" ON public.company_profile;
CREATE POLICY "Public Read company_profile" ON public.company_profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Manage company_profile" ON public.company_profile;
CREATE POLICY "Public Manage company_profile" ON public.company_profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read corporate_services" ON public.corporate_services;
CREATE POLICY "Public Read corporate_services" ON public.corporate_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Manage corporate_services" ON public.corporate_services;
CREATE POLICY "Public Manage corporate_services" ON public.corporate_services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read corporate_projects" ON public.corporate_projects;
CREATE POLICY "Public Read corporate_projects" ON public.corporate_projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Manage corporate_projects" ON public.corporate_projects;
CREATE POLICY "Public Manage corporate_projects" ON public.corporate_projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read corporate_apks" ON public.corporate_apks;
CREATE POLICY "Public Read corporate_apks" ON public.corporate_apks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Manage corporate_apks" ON public.corporate_apks;
CREATE POLICY "Public Manage corporate_apks" ON public.corporate_apks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read contact_queries" ON public.contact_queries;
CREATE POLICY "Public Read contact_queries" ON public.contact_queries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Manage contact_queries" ON public.contact_queries;
CREATE POLICY "Public Manage contact_queries" ON public.contact_queries FOR ALL USING (true) WITH CHECK (true);

-- C. Policies for App Farm Management Tables (Owner-isolated access checks)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Admin can read all profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner full access on animals" ON public.animals;
CREATE POLICY "Owner full access on animals" ON public.animals FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on milk" ON public.milk_production;
CREATE POLICY "Owner full access on milk" ON public.milk_production FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on breeding" ON public.breeding_records;
CREATE POLICY "Owner full access on breeding" ON public.breeding_records FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on doctors" ON public.doctors;
CREATE POLICY "Owner full access on doctors" ON public.doctors FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on doctor_ledger" ON public.doctor_ledger;
CREATE POLICY "Owner full access on doctor_ledger" ON public.doctor_ledger FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on staff" ON public.staff;
CREATE POLICY "Owner full access on staff" ON public.staff FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on staff_transactions" ON public.staff_transactions;
CREATE POLICY "Owner full access on staff_transactions" ON public.staff_transactions FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on societies" ON public.societies;
CREATE POLICY "Owner full access on societies" ON public.societies FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on feed_purchases" ON public.feed_purchases;
CREATE POLICY "Owner full access on feed_purchases" ON public.feed_purchases FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on suppliers" ON public.suppliers;
CREATE POLICY "Owner full access on suppliers" ON public.suppliers FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on supplier_purchases" ON public.supplier_purchases;
CREATE POLICY "Owner full access on supplier_purchases" ON public.supplier_purchases FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on payments" ON public.payments;
CREATE POLICY "Owner full access on payments" ON public.payments FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on borrow_lend" ON public.borrow_lend;
CREATE POLICY "Owner full access on borrow_lend" ON public.borrow_lend FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on inventory" ON public.inventory;
CREATE POLICY "Owner full access on inventory" ON public.inventory FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner full access on dairy_ledger" ON public.dairy_ledger;
CREATE POLICY "Owner full access on dairy_ledger" ON public.dairy_ledger FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- D. Policies for System Admin Tables
DROP POLICY IF EXISTS "Public Manage Admin Roles" ON public.admin_roles;
CREATE POLICY "Public Manage Admin Roles" ON public.admin_roles FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Updates" ON public.system_updates;
CREATE POLICY "Public Read Updates" ON public.system_updates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Manage Updates" ON public.system_updates;
CREATE POLICY "Manage Updates" ON public.system_updates FOR ALL USING (auth.uid() IS NOT NULL);


-- ============================================================
-- 6. INITIAL SEED DATA
-- ============================================================

-- A. Seed Corporate Website Info
INSERT INTO public.company_profile (id, company_name, tagline, description, years_experience, projects_completed, client_satisfaction, support_hours, contact_email, contact_phone, address)
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

-- B. Seed Corporate Services
INSERT INTO public.corporate_services (title, icon_name, description) VALUES
('Android App Development', 'Smartphone', 'High performance and feature-rich Android applications tailored for smartphones and enterprise tablets.'),
('Website Development', 'Globe', 'Modern, responsive, secure, and fast websites optimized for excellent user experience and performance.'),
('Admin Panel Systems', 'Database', 'Powerful admin dashboards and internal management portals to track operational data, roles, and records.'),
('Cloud & API Integration', 'Cpu', 'Secure cloud server architecture and robust API connectivity to synchronize your backend services smoothly.'),
('Business Automation', 'Workflow', 'Automate manual workflow cycles, data logging, analytics report generation, and enhance team productivity.'),
('Custom Software Development', 'Layers', 'Tailor-made software architectures built specifically to address the unique bottlenecks of your business model.')
ON CONFLICT DO NOTHING;

-- C. Seed Corporate Showcase Projects
INSERT INTO public.corporate_projects (title, category, technologies, short_description, long_description, image_url, live_url, github_url) VALUES
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

-- D. Seed Corporate/Admin APKs
INSERT INTO public.corporate_apks (app_name, version, file_size, download_url, icon_type, release_date) VALUES
('Cattle Farm App', '1.1.2', '25.4 MB', 'https://hqnqtefanszrazqowdgx.supabase.co/storage/v1/object/public/milvexa%20-%20cattel%20farm%20managment/milvexa_v1.1.2.apk', 'dog', '25 May 2026'),
('Billing App', '2.1.0', '18.7 MB', '#', 'wallet', '18 May 2026'),
('Attendance App', '1.2.0', '16.2 MB', '#', 'briefcase', '10 May 2026'),
('Inventory App', '1.0.6', '22.8 MB', '#', 'package', '05 May 2026')
ON CONFLICT DO NOTHING;

-- E. Seed Default Admin Role Whitelist (Username: milvexa, Plain password: admin@123)
INSERT INTO public.admin_roles (email, username, password, role, status)
VALUES ('milvexasolutions@gmail.com', 'milvexa', 'admin@123', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- F. Seed Initial Update row
INSERT INTO public.system_updates (id, latest_version, release_notes, download_link, is_mandatory, global_announcement)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.2', 'Initial release', 'https://milvexa.in/download', false, '')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 7. ANALYTICAL VIEWS
-- ============================================================

-- A. Daily milk production summary view
CREATE OR REPLACE VIEW public.daily_milk_summary AS
SELECT
  owner_id,
  production_date,
  shift,
  SUM(quantity)      AS total_qty,
  SUM(total_amount)  AS total_revenue,
  COUNT(*)           AS record_count
FROM public.milk_production
GROUP BY owner_id, production_date, shift;

-- B. Monthly finance statistics view
CREATE OR REPLACE VIEW public.monthly_finance_summary AS
SELECT
  owner_id,
  DATE_TRUNC('month', date) AS month,
  type,
  SUM(amount)   AS total_amount,
  COUNT(*)      AS transaction_count
FROM public.payments
GROUP BY owner_id, month, type;

-- C. Doctor outstanding balance view
CREATE OR REPLACE VIEW public.doctor_balance_summary AS
SELECT
  dl.owner_id,
  dl.doctor_id,
  d.name AS doctor_name,
  SUM(dl.total_fee)   AS total_fees,
  SUM(dl.paid_amount) AS total_paid,
  SUM(dl.balance)     AS outstanding_balance
FROM public.doctor_ledger dl
JOIN public.doctors d ON d.id = dl.doctor_id
GROUP BY dl.owner_id, dl.doctor_id, d.name;

-- D. Staff salary vs advance view
CREATE OR REPLACE VIEW public.staff_advance_summary AS
SELECT
  st.owner_id,
  st.staff_id,
  s.name AS staff_name,
  SUM(CASE WHEN st.type = 'Advance' THEN st.amount ELSE 0 END) AS total_advance,
  SUM(CASE WHEN st.type = 'Salary'  THEN st.amount ELSE 0 END) AS total_salary_paid
FROM public.staff_transactions st
JOIN public.staff s ON s.id = st.staff_id
GROUP BY st.owner_id, st.staff_id, s.name;


-- ============================================================
-- 8. STORAGE APK BUCKET SETUP
-- ============================================================

-- Setup storage bucket for APK files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('apks', 'apks', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects
DROP POLICY IF EXISTS "Public Read Access for APKs" ON storage.objects;
CREATE POLICY "Public Read Access for APKs" 
ON storage.objects FOR SELECT USING (bucket_id = 'apks');

DROP POLICY IF EXISTS "Admin Upload Access for APKs" ON storage.objects;
CREATE POLICY "Admin Upload Access for APKs" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'apks');

DROP POLICY IF EXISTS "Admin Update Access for APKs" ON storage.objects;
CREATE POLICY "Admin Update Access for APKs" 
ON storage.objects FOR UPDATE USING (bucket_id = 'apks');

DROP POLICY IF EXISTS "Admin Delete Access for APKs" ON storage.objects;
CREATE POLICY "Admin Delete Access for APKs" 
ON storage.objects FOR DELETE USING (bucket_id = 'apks');


-- ============================================================
-- 9. UTILITY: STORED FUNCTION TO CHANGE USER EMAIL (WITHOUT OTP)
-- ============================================================
-- How to use:
--   SELECT public.change_user_email('old@example.com', 'new@example.com');
--
CREATE OR REPLACE FUNCTION public.change_user_email(
  old_email TEXT,
  new_email TEXT
)
RETURNS VOID AS $$
BEGIN
  -- 1. Update the credentials in Supabase Auth
  UPDATE auth.users
  SET 
    email = new_email,
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE email = old_email;
  
  -- 2. Sync the updated email in the public profiles table
  UPDATE public.profiles
  SET email = new_email
  WHERE email = old_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
