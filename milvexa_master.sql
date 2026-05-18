-- ============================================================
--  MILVEXA FARM MANAGEMENT - MASTER SQL FILE
--  Run this in Supabase SQL Editor (in order)
--  Tables: profiles, animals, milk_production, breeding_records,
--          doctors, staff, staff_transactions, societies,
--          feed_purchases, suppliers, supplier_purchases, payments
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE (synced with auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  owner_name   TEXT,
  farm_name    TEXT,
  phone        TEXT,
  email        TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  is_blocked   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
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

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin: allow reading all profiles (for admin panel)
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT
  USING (true); -- Adjust with admin role check if needed


-- ============================================================
-- 2. ANIMALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.animals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  tag_id         TEXT,
  tag_number     TEXT,
  type           TEXT DEFAULT 'Cow'
                   CHECK (type IN ('Cow', 'Buffalo', 'Goat', 'Sheep')),
  breed          TEXT,
  gender         TEXT DEFAULT 'Female'
                   CHECK (gender IN ('Male', 'Female')),
  status         TEXT DEFAULT 'Milch'
                   CHECK (status IN ('Milch', 'Dry', 'Baby', 'Sold', 'Dead')),
  health_status  TEXT DEFAULT 'Healthy'
                   CHECK (health_status IN ('Healthy', 'Sick', 'Pregnant')),
  purchase_price NUMERIC(12, 2),
  purchase_date  DATE,
  sale_price     NUMERIC(12, 2),
  sale_date      DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animals_owner ON public.animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_status ON public.animals(status);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on animals" ON public.animals;
CREATE POLICY "Owner full access on animals"
  ON public.animals FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 3. MILK PRODUCTION TABLE (also stores milk sales)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.milk_production (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_id        UUID REFERENCES public.animals(id) ON DELETE SET NULL,
  quantity         NUMERIC(8, 2) NOT NULL,
  shift            TEXT DEFAULT 'Morning'
                     CHECK (shift IN ('Morning', 'Evening')),
  production_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Milk sale fields (filled when sold to society)
  society          TEXT,
  fat              NUMERIC(5, 2),
  snf              NUMERIC(5, 2),
  price_per_liter  NUMERIC(8, 2),
  total_amount     NUMERIC(12, 2),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milk_owner ON public.milk_production(owner_id);
CREATE INDEX IF NOT EXISTS idx_milk_date  ON public.milk_production(production_date);

ALTER TABLE public.milk_production ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on milk" ON public.milk_production;
CREATE POLICY "Owner full access on milk"
  ON public.milk_production FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 4. BREEDING RECORDS TABLE
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
                   CHECK (status IN ('Pending', 'Confirmed', 'Failed', 'Delivered')),
  note           TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breeding_owner ON public.breeding_records(owner_id);

ALTER TABLE public.breeding_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on breeding" ON public.breeding_records;
CREATE POLICY "Owner full access on breeding"
  ON public.breeding_records FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 5. DOCTORS TABLE
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
-- 6. STAFF TABLE
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
-- 7. STAFF TRANSACTIONS TABLE (Salary / Advance)
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

CREATE INDEX IF NOT EXISTS idx_staff_tx_owner ON public.staff_transactions(owner_id);

ALTER TABLE public.staff_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on staff_transactions" ON public.staff_transactions;
CREATE POLICY "Owner full access on staff_transactions"
  ON public.staff_transactions FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 8. SOCIETIES TABLE (Dairy Cooperatives)
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
-- 9. FEED PURCHASES TABLE (from societies)
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

ALTER TABLE public.feed_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on feed_purchases" ON public.feed_purchases;
CREATE POLICY "Owner full access on feed_purchases"
  ON public.feed_purchases FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- 10. SUPPLIERS TABLE
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
-- 11. SUPPLIER PURCHASES TABLE
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
-- 12. PAYMENTS TABLE (Finance - Income & Expense)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL
                CHECK (type IN ('Income', 'Expense')),
  amount      NUMERIC(12, 2) NOT NULL,
  category    TEXT,
  -- Expense categories: Feed, Medicine, Salary, Doctor Fee, Electricity, Maintenance, Animal Purchase, Other
  -- Income categories: Milk Sale, Society Payment, Animal Sale, Manure Sale, Other
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
-- HELPER VIEWS
-- ============================================================

-- Daily milk summary view
CREATE OR REPLACE VIEW public.daily_milk_summary AS
SELECT
  owner_id,
  production_date,
  shift,
  SUM(quantity)       AS total_qty,
  SUM(total_amount)   AS total_revenue,
  COUNT(*)            AS record_count
FROM public.milk_production
GROUP BY owner_id, production_date, shift;

-- Monthly finance summary view
CREATE OR REPLACE VIEW public.monthly_finance_summary AS
SELECT
  owner_id,
  DATE_TRUNC('month', date) AS month,
  type,
  SUM(amount)   AS total_amount,
  COUNT(*)      AS transaction_count
FROM public.payments
GROUP BY owner_id, month, type;


-- ============================================================
-- SAMPLE DATA (optional - for testing)
-- Replace 'YOUR_USER_ID' with an actual auth.users UUID
-- ============================================================

/*
-- Uncomment and replace YOUR_USER_ID to insert sample data

DO $$
DECLARE
  uid UUID := 'YOUR_USER_ID';  -- replace with real user UUID
  cow1 UUID := uuid_generate_v4();
  cow2 UUID := uuid_generate_v4();
  doc1 UUID := uuid_generate_v4();
  staff1 UUID := uuid_generate_v4();
  soc1 UUID := uuid_generate_v4();
  sup1 UUID := uuid_generate_v4();
BEGIN

-- Animals
INSERT INTO public.animals (id, owner_id, name, tag_number, type, breed, status, health_status, purchase_price, purchase_date)
VALUES
  (cow1, uid, 'Ganga', 'TAG001', 'Cow', 'Gir', 'Milch', 'Healthy', 45000, '2025-01-10'),
  (cow2, uid, 'Laxmi', 'TAG002', 'Buffalo', 'Murrah', 'Milch', 'Healthy', 60000, '2025-03-15');

-- Milk Production
INSERT INTO public.milk_production (owner_id, animal_id, quantity, shift, production_date)
VALUES
  (uid, cow1, 8.5, 'Morning', CURRENT_DATE),
  (uid, cow1, 7.0, 'Evening', CURRENT_DATE),
  (uid, cow2, 12.0, 'Morning', CURRENT_DATE),
  (uid, cow2, 10.5, 'Evening', CURRENT_DATE),
  (uid, NULL, 38.0, 'Morning', CURRENT_DATE - 1);  -- collective

-- Milk Sale
INSERT INTO public.milk_production (owner_id, quantity, shift, production_date, society, fat, snf, price_per_liter, total_amount)
VALUES
  (uid, 38.0, 'Morning', CURRENT_DATE - 1, 'Amul Dairy', 6.5, 8.5, 52.00, 1976.00);

-- Doctor
INSERT INTO public.doctors (id, owner_id, name, specialty, phone, address)
VALUES
  (doc1, uid, 'Dr. Rajesh Sharma', 'Large Animal Specialist', '+91 98765 43210', 'Civil Hospital Road, Gwalior');

-- Staff
INSERT INTO public.staff (id, owner_id, name, role, phone, salary_amount, joining_date)
VALUES
  (staff1, uid, 'Ram Singh', 'Milker', '9876500001', 8000, '2025-01-01');

-- Staff Salary
INSERT INTO public.staff_transactions (owner_id, staff_id, type, amount, date, note)
VALUES
  (uid, staff1, 'Salary', 8000, CURRENT_DATE - 5, 'April Salary');

-- Society
INSERT INTO public.societies (id, owner_id, name, location, contact_person, contact_number)
VALUES
  (soc1, uid, 'Amul Dairy Society', 'Anand, Gujarat', 'Rajesh Kumar', '+91 99887 76655');

-- Feed Purchase (from society)
INSERT INTO public.feed_purchases (owner_id, society_id, item_name, quantity, unit_price, date)
VALUES
  (uid, soc1, 'Cotton Cake', 5, 1200, CURRENT_DATE - 3),
  (uid, soc1, 'Cattle Feed', 10, 850, CURRENT_DATE - 3);

-- Supplier
INSERT INTO public.suppliers (id, owner_id, name, phone, address)
VALUES
  (sup1, uid, 'Kisan Feed Agency', '+91 98700 11223', 'New Market, Gwalior');

-- Supplier Purchase
INSERT INTO public.supplier_purchases (owner_id, supplier_id, item_name, quantity, unit_price, purchase_date)
VALUES
  (uid, sup1, 'Khal (Mustard Cake)', 8, 950, CURRENT_DATE - 7),
  (uid, sup1, 'Churi', 15, 600, CURRENT_DATE - 7);

-- Breeding Record
INSERT INTO public.breeding_records (owner_id, animal_id, breeding_date, type, bull_details, status)
VALUES
  (uid, cow1, CURRENT_DATE - 30, 'AI', 'Semen ID: GIR-X-104', 'Pending');

-- Finance Transactions
INSERT INTO public.payments (owner_id, type, amount, category, date, note)
VALUES
  (uid, 'Income', 1976.00, 'Milk Sale',     CURRENT_DATE - 1, 'Morning milk sale to Amul'),
  (uid, 'Income', 3500.00, 'Society Payment', CURRENT_DATE - 5, 'April 1-15 settlement'),
  (uid, 'Expense', 6000.00, 'Feed',           CURRENT_DATE - 3, 'Cotton Cake + Cattle Feed'),
  (uid, 'Expense', 8000.00, 'Salary',         CURRENT_DATE - 5, 'Ram Singh April Salary'),
  (uid, 'Expense', 1500.00, 'Medicine',       CURRENT_DATE - 10, 'Vitamins + Deworming');

END $$;

*/

-- ============================================================
-- SUMMARY OF ALL TABLES
-- ============================================================
/*
  TABLE                  | PURPOSE
  -----------------------|-----------------------------------------------
  profiles               | Registered users (synced from auth.users)
  animals                | Cattle records (cow, buffalo, calf, bull)
  milk_production        | Daily milk records + society milk sales
  breeding_records       | AI / Natural breeding logs
  doctors                | Veterinary doctor profiles
  staff                  | Farm employees
  staff_transactions     | Salary & advance payments to staff
  societies              | Dairy cooperative societies
  feed_purchases         | Feed bought from societies
  suppliers              | Feed/medicine suppliers
  supplier_purchases     | Purchases from suppliers
  payments               | Income & Expense finance tracker

  VIEWS
  -----------------------|-----------------------------------------------
  daily_milk_summary     | Aggregated milk per day/shift
  monthly_finance_summary| Monthly income/expense summary
*/
