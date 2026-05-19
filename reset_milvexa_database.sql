-- ==========================================
-- ⚠️ MILVEXA COMPLETE DATABASE RESET SCRIPT ⚠️
-- ==========================================
-- 🚨 WARNING: RUNNING THIS SCRIPT WILL PERMANENTLY DELETE ALL YOUR EXISTING DATA!
-- It will drop all tables and recreate them as empty, fresh tables.

-- ==========================================
-- 1. DROP EXISTING TABLES (REMOVES ALL OLD DATA)
-- ==========================================

DROP TABLE IF EXISTS milk_production CASCADE;
DROP TABLE IF EXISTS breeding_records CASCADE;
DROP TABLE IF EXISTS animals CASCADE;
DROP TABLE IF EXISTS worker_payments CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS finance CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TABLE IF EXISTS system_updates CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;


-- ==========================================
-- 2. RECREATE CORE TABLES (FRESH & EMPTY)
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    farm_name TEXT,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANIMALS Table
CREATE TABLE IF NOT EXISTS animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tag_number TEXT UNIQUE NOT NULL,
    name TEXT,
    type TEXT CHECK (type IN ('Cow', 'Buffalo')),
    breed TEXT,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    status TEXT CHECK (status IN ('Milch', 'Dry', 'Baby', 'Sold', 'Dead')),
    health_status TEXT CHECK (health_status IN ('Healthy', 'Sick', 'Pregnant')),
    age NUMERIC,
    weight NUMERIC,
    color TEXT,
    baby_details TEXT,
    expected_delivery_date DATE,
    purchase_date DATE,
    purchase_price NUMERIC,
    sale_date DATE,
    sale_price NUMERIC,
    tag_id TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MILK PRODUCTION Table
CREATE TABLE IF NOT EXISTS milk_production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    shift TEXT CHECK (shift IN ('Morning', 'Evening')),
    production_date DATE NOT NULL DEFAULT CURRENT_DATE,
    fat NUMERIC,
    snf NUMERIC,
    price_per_liter NUMERIC,
    total_amount NUMERIC,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FINANCE (PAYMENTS) Table
CREATE TABLE IF NOT EXISTS finance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type TEXT CHECK (transaction_type IN ('Income', 'Expense')),
    category TEXT,
    amount NUMERIC NOT NULL,
    description TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVENTORY Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity NUMERIC DEFAULT 0,
    unit TEXT,
    reorder_level NUMERIC DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORKERS Table
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    salary_amount NUMERIC,
    salary_period TEXT CHECK (salary_period IN ('Monthly', 'Daily')),
    status TEXT DEFAULT 'Active',
    role TEXT,
    joining_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WORKER PAYMENTS Table
CREATE TABLE IF NOT EXISTS worker_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_type TEXT CHECK (payment_type IN ('Salary', 'Advance', 'Bonus')),
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTACTS (PARTNERS) Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('Other', 'Supplier', 'Doctor')),
    phone TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PURCHASES (PARTNER TRANSACTIONS) Table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    description TEXT,
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    status TEXT CHECK (status IN ('Paid', 'Unpaid', 'Partial', 'Held')),
    purchase_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BREEDING RECORDS Table
CREATE TABLE IF NOT EXISTS breeding_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    insemination_date DATE NOT NULL,
    inseminator_name TEXT,
    dose_price NUMERIC DEFAULT 0,
    breeding_type TEXT CHECK (breeding_type IN ('AI', 'Natural')),
    status TEXT CHECK (status IN ('Pending', 'Success', 'Failed')),
    expected_delivery_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. RECREATE ADMIN TABLES
-- ==========================================

-- 11. ADMIN ROLES
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT CHECK (role IN ('super_admin', 'staff')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_roles (email, password, role, status)
VALUES ('milvexasolutions@gmail.com', 'admin@123', 'super_admin', 'active');

-- 12. SYSTEM UPDATES
CREATE TABLE IF NOT EXISTS system_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latest_version TEXT NOT NULL,
    release_notes TEXT,
    download_link TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT false,
    global_announcement TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_updates (id, latest_version, release_notes, download_link, is_mandatory, global_announcement)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '1.0.0',
    'Initial Release',
    'https://milvexa.in/download',
    false,
    ''
);

-- ==========================================
-- 4. SETUP ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_updates ENABLE ROW LEVEL SECURITY;

-- Allow all operations globally for profiles & core tables (for simplicity during reset)
CREATE POLICY "Public Manage Profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Public Manage Animals" ON animals FOR ALL USING (true);
CREATE POLICY "Public Manage Milk" ON milk_production FOR ALL USING (true);
CREATE POLICY "Public Manage Finance" ON finance FOR ALL USING (true);
CREATE POLICY "Public Manage Inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Public Manage Workers" ON workers FOR ALL USING (true);
CREATE POLICY "Public Manage Worker Payments" ON worker_payments FOR ALL USING (true);
CREATE POLICY "Public Manage Contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "Public Manage Purchases" ON purchases FOR ALL USING (true);
CREATE POLICY "Public Manage Breeding" ON breeding_records FOR ALL USING (true);

CREATE POLICY "Public Manage Admin Roles" ON admin_roles FOR ALL USING (true);
CREATE POLICY "Public Manage System Updates" ON system_updates FOR ALL USING (true);

-- ==========================================
-- 5. AUTOMATION: PROFILE CREATION ON SIGNUP
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, farm_name, owner_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'farm_name',
    NEW.raw_user_meta_data->>'owner_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
