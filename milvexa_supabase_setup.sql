-- ====================================================================
--  MILVEXA FARM MANAGEMENT - SUPABASE COMPLETE SETUP SQL
--  ✅ Ek baar Supabase SQL Editor mein paste karke Run karo
--  ✅ Saari tables, RLS policies, triggers, indexes sab create hoga
--  ✅ Safe to re-run (IF NOT EXISTS used everywhere)
-- ====================================================================
-- Supabase mein kaise chalayein:
--   1. Supabase Dashboard open karo
--   2. Left sidebar → SQL Editor
--   3. "New Query" click karo
--   4. Ye poori file paste karo
--   5. "Run" button dabao
-- ====================================================================


-- ============================================================
-- STEP 1: EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- STEP 2: PROFILES TABLE
--          (auth.users se sync hoti hai)
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles"  ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT USING (true);

-- Auto profile trigger on signup
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


-- ============================================================
-- STEP 3: ANIMALS TABLE
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
                     CHECK (health_status IN ('Healthy', 'Sick', 'Pregnant')),
  pregnant_status  TEXT DEFAULT 'Not Pregnant'
                     CHECK (pregnant_status IN ('Pregnant', 'Not Pregnant')),
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
DROP POLICY IF EXISTS "Owner full access on animals" ON public.animals;
CREATE POLICY "Owner full access on animals"
  ON public.animals FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);


-- ============================================================
-- STEP 4: MILK PRODUCTION TABLE
--          (Daily milk + Society milk sales dono)
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
-- STEP 5: BREEDING RECORDS TABLE
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
-- STEP 6: DOCTORS TABLE
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
-- STEP 7: DOCTOR LEDGER TABLE
--          (Doctor fee + payment tracking)
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
-- STEP 8: STAFF TABLE
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
-- STEP 9: STAFF TRANSACTIONS TABLE
--          (Salary / Advance / Upaad payments)
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
-- STEP 10: SOCIETIES TABLE (Dairy Cooperatives)
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
-- STEP 11: FEED PURCHASES TABLE
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
-- STEP 12: SUPPLIERS TABLE
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
-- STEP 13: SUPPLIER PURCHASES TABLE
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
-- STEP 14: PAYMENTS TABLE (Finance - Income & Expense)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
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
-- STEP 15: INVENTORY TABLE (Feed Stock - Dashboard mein show)
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
-- STEP 16: USEFUL VIEWS
-- ============================================================

-- Daily milk summary
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

-- Monthly income vs expense
CREATE OR REPLACE VIEW public.monthly_finance_summary AS
SELECT
  owner_id,
  DATE_TRUNC('month', date) AS month,
  type,
  SUM(amount)   AS total_amount,
  COUNT(*)      AS transaction_count
FROM public.payments
GROUP BY owner_id, month, type;

-- Doctor outstanding balance summary
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

-- Staff advance outstanding
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
-- STEP 17: VERIFY ALL TABLES CREATED
--          Ye query chalao to check karo sab tables hain ya nahi
-- ============================================================
/*
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
*/

-- ============================================================
-- ✅ SETUP COMPLETE!
-- TABLE SUMMARY:
-- ============================================================
/*
  #  | TABLE                | PURPOSE
  ---|----------------------|------------------------------------------
  1  | profiles             | User accounts (Auth se sync)
  2  | animals              | Cattle records
  3  | milk_production      | Daily milk + milk sales
  4  | breeding_records     | AI/Natural breeding logs
  5  | doctors              | Vet doctor profiles
  6  | doctor_ledger        | Doctor fee & payment records
  7  | staff                | Farm employees
  8  | staff_transactions   | Salary & advance payments
  9  | societies            | Dairy cooperative societies
  10 | feed_purchases       | Feed bought from societies
  11 | suppliers            | Feed/medicine suppliers
  12 | supplier_purchases   | Purchases from suppliers
  13 | payments             | Income & Expense finance tracker
  14 | inventory            | Feed stock tracker (Dashboard)

  VIEWS (auto-calculated):
  - daily_milk_summary
  - monthly_finance_summary
  - doctor_balance_summary
  - staff_advance_summary
*/
