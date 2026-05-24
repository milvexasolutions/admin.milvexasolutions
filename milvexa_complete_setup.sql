-- ====================================================================
--  🐄 MILVEXA FARM MANAGEMENT - COMPLETE DATABASE SETUP SQL 🐄
-- ====================================================================
--  ✅ Clear & Comprehensive SQL script to set up all tables, indexes,
--     RLS (Row Level Security) policies, triggers, views, and storage.
--  ✅ Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS).
-- ====================================================================
-- How to run in Supabase:
--   1. Open Supabase Dashboard.
--   2. Go to SQL Editor (Left sidebar).
--   3. Create a "New Query".
--   4. Paste this entire script and click "Run".
-- ====================================================================

-- ============================================================
-- 1. SETUP EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. PROFILES TABLE (Syncs with auth.users)
-- ============================================================
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles"  ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT USING (true);

-- Trigger: Automatically create profile on signup
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

-- Trigger: Automatically update profile email when user changes auth email
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
-- 3. ANIMALS TABLE (Cattle Records)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_animals_owner  ON public.animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_status ON public.animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_type   ON public.animals(type);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.animals ADD COLUMN IF NOT EXISTS calf_mother_type TEXT CHECK (calf_mother_type IN ('Cow', 'Buffalo'));

DROP POLICY IF EXISTS "Owner full access on animals" ON public.animals;
CREATE POLICY "Owner full access on animals"
  ON public.animals FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 4. MILK PRODUCTION TABLE (Daily yields & direct dairy pours)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_milk_owner ON public.milk_production(owner_id);
CREATE INDEX IF NOT EXISTS idx_milk_date  ON public.milk_production(production_date);
CREATE INDEX IF NOT EXISTS idx_milk_animal ON public.milk_production(animal_id);

ALTER TABLE public.milk_production ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on milk" ON public.milk_production;
CREATE POLICY "Owner full access on milk"
  ON public.milk_production FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 5. BREEDING RECORDS TABLE
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_breeding_owner ON public.breeding_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_breeding_animal ON public.breeding_records(animal_id);

ALTER TABLE public.breeding_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on breeding" ON public.breeding_records;
CREATE POLICY "Owner full access on breeding"
  ON public.breeding_records FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 6. VET DOCTORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.doctors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  specialty   TEXT,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_owner ON public.doctors(owner_id);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on doctors" ON public.doctors;
CREATE POLICY "Owner full access on doctors"
  ON public.doctors FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 7. DOCTOR LEDGER TABLE (Vet transactions)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_doctor_ledger_owner     ON public.doctor_ledger(owner_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ledger_doctor_id ON public.doctor_ledger(doctor_id);

ALTER TABLE public.doctor_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on doctor_ledger" ON public.doctor_ledger;
CREATE POLICY "Owner full access on doctor_ledger"
  ON public.doctor_ledger FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 8. STAFF TABLE (Farm workers)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_staff_owner ON public.staff(owner_id);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on staff" ON public.staff;
CREATE POLICY "Owner full access on staff"
  ON public.staff FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 9. STAFF TRANSACTIONS TABLE (Advance & Salary payments)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_staff_tx_owner    ON public.staff_transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_tx_staff_id ON public.staff_transactions(staff_id);

ALTER TABLE public.staff_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on staff_transactions" ON public.staff_transactions;
CREATE POLICY "Owner full access on staff_transactions"
  ON public.staff_transactions FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 10. SOCIETIES TABLE (Dairy Cooperative Centers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.societies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  location        TEXT,
  contact_person  TEXT,
  contact_number  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_societies_owner ON public.societies(owner_id);

ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on societies" ON public.societies;
CREATE POLICY "Owner full access on societies"
  ON public.societies FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 11. FEED PURCHASES TABLE (Purchased via Cooperative Societies)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_feed_purchases_owner ON public.feed_purchases(owner_id);
CREATE INDEX IF NOT EXISTS idx_feed_purchases_date  ON public.feed_purchases(date);

ALTER TABLE public.feed_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on feed_purchases" ON public.feed_purchases;
CREATE POLICY "Owner full access on feed_purchases"
  ON public.feed_purchases FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 12. SUPPLIERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_owner ON public.suppliers(owner_id);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on suppliers" ON public.suppliers;
CREATE POLICY "Owner full access on suppliers"
  ON public.suppliers FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 13. SUPPLIER PURCHASES TABLE (Direct Stock Purchases)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_supplier_purchases_owner ON public.supplier_purchases(owner_id);

ALTER TABLE public.supplier_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on supplier_purchases" ON public.supplier_purchases;
CREATE POLICY "Owner full access on supplier_purchases"
  ON public.supplier_purchases FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 14. PAYMENTS TABLE (Financial Transactions & Balance Sheet)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_payments_owner ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_type  ON public.payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_date  ON public.payments(date);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on payments" ON public.payments;
CREATE POLICY "Owner full access on payments"
  ON public.payments FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 14b. BORROW & LEND TABLE (Credit & Debit Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.borrow_lend (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('Credit', 'Debit')), -- Credit = borrowed (money taken), Debit = lent (money given)
  amount      NUMERIC(12, 2) NOT NULL,
  status      TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Settled')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_borrow_lend_owner ON public.borrow_lend(owner_id);
CREATE INDEX IF NOT EXISTS idx_borrow_lend_type  ON public.borrow_lend(type);
CREATE INDEX IF NOT EXISTS idx_borrow_lend_status ON public.borrow_lend(status);

ALTER TABLE public.borrow_lend ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on borrow_lend" ON public.borrow_lend;
CREATE POLICY "Owner full access on borrow_lend"
  ON public.borrow_lend FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 15. INVENTORY TABLE (Feed & Medicine Stock management)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_inventory_owner    ON public.inventory(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on inventory" ON public.inventory;
CREATE POLICY "Owner full access on inventory"
  ON public.inventory FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 16. DAIRY LEDGER TABLE (Dairy milk payouts tracking)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_dairy_ledger_owner ON public.dairy_ledger(owner_id);
CREATE INDEX IF NOT EXISTS idx_dairy_ledger_dates ON public.dairy_ledger(period_start, period_end);

ALTER TABLE public.dairy_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on dairy_ledger" ON public.dairy_ledger;
CREATE POLICY "Owner full access on dairy_ledger"
  ON public.dairy_ledger FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 17. ADMIN ROLES TABLE (Custom whitelists for Admin Portal)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT, -- Plain text password for admin panel visibility
    role        TEXT CHECK (role IN ('super_admin', 'staff')),
    status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Manage Admin Roles" ON public.admin_roles;
CREATE POLICY "Public Manage Admin Roles" ON public.admin_roles FOR ALL USING (true);

-- Insert Default Super Admin
INSERT INTO public.admin_roles (email, password, role, status)
VALUES ('milvexasolutions@gmail.com', 'admin@123', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- 18. SYSTEM UPDATES TABLE (APK & Release notes manager)
-- ============================================================
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

ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Updates" ON public.system_updates;
CREATE POLICY "Public Read Updates" ON public.system_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage Updates" ON public.system_updates;
CREATE POLICY "Manage Updates" ON public.system_updates FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert Initial Updates Config Row
INSERT INTO public.system_updates (id, latest_version, release_notes, download_link, is_mandatory, global_announcement)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.0.0', 'Initial release', 'https://milvexa.in/download', false, '')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 19. ANALYTICAL VIEWS
-- ============================================================

-- Daily milk production view
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

-- Monthly finance statistics view
CREATE OR REPLACE VIEW public.monthly_finance_summary AS
SELECT
  owner_id,
  DATE_TRUNC('month', date) AS month,
  type,
  SUM(amount)   AS total_amount,
  COUNT(*)      AS transaction_count
FROM public.payments
GROUP BY owner_id, month, type;

-- Doctor outstanding balance view
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

-- Staff salary vs advance view
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
-- 20. STORAGE APK BUCKET SETUP
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
-- 21. UTILITY: STORED FUNCTION TO CHANGE USER EMAIL (WITHOUT OTP)
-- ============================================================
-- This function allows you to safely change a user's login email address
-- from the SQL editor without triggering verification OTPs.
--
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

