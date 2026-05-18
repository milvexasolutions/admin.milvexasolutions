-- ============================================================
--  MILVEXA - MISSING TABLES SQL
--  Ye tables main (milvexa_master.sql) mein nahi the
--  Supabase SQL Editor mein chalao
-- ============================================================


-- ============================================================
-- 1. DOCTOR LEDGER TABLE
--    (DoctorLedger.jsx aur DoctorList.jsx mein use hoti hai)
--    Fields: doctor_id, date, reason, total_fee, paid_amount, balance
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
-- 2. INVENTORY TABLE
--    (Dashboard mein Feed Stock dikhane ke liye use hoti hai)
--    Fields: category, item_name, quantity, unit, min_stock
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'Feed'
                CHECK (category IN ('Feed', 'Medicine', 'Equipment', 'Other')),
  item_name   TEXT NOT NULL,
  quantity    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit        TEXT DEFAULT 'Kg',
  min_stock   NUMERIC(10, 2) DEFAULT 0,    -- alert threshold
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
-- 3. ANIMALS TABLE - MISSING COLUMN FIX
--    pregnant_status column add karo agar nahi hai
--    (BreedingList.jsx mein use hota hai)
-- ============================================================
ALTER TABLE public.animals
  ADD COLUMN IF NOT EXISTS pregnant_status TEXT DEFAULT 'Not Pregnant'
    CHECK (pregnant_status IN ('Pregnant', 'Not Pregnant'));

-- tag_id column (kuch jagah tag_id use hota hai)
ALTER TABLE public.animals
  ADD COLUMN IF NOT EXISTS tag_id TEXT;

-- note / description column
ALTER TABLE public.animals
  ADD COLUMN IF NOT EXISTS note TEXT;


-- ============================================================
-- 4. MILK_PRODUCTION TABLE - MISSING COLUMN FIX
--    society column add karo (SellMilk.jsx mein use hota hai)
-- ============================================================
ALTER TABLE public.milk_production
  ADD COLUMN IF NOT EXISTS society TEXT;


-- ============================================================
-- 5. STAFF_TRANSACTIONS TABLE - VERIFY COLUMNS
-- ============================================================
-- Already created in milvexa_master.sql - no changes needed


-- ============================================================
-- COMPLETE TABLE LIST (milvexa_master.sql + ye file)
-- ============================================================
/*
  TABLE                | FILE WHERE USED
  ---------------------|------------------------------------------------
  profiles             | AdminPanel.jsx, AuthContext
  animals              | AddAnimal, AnimalList, EditAnimal, AddBreeding
  milk_production      | AddMilk, SellMilk, MilkReport, EditMilk
  breeding_records     | AddBreeding, BreedingList, EditBreeding
  doctors              | AddDoctor, DoctorList, EditDoctor, DoctorLedger
  doctor_ledger        | DoctorLedger.jsx, DoctorList.jsx  ← THIS FILE
  staff                | AddStaff, StaffList, EditStaff, StaffSalary
  staff_transactions   | StaffSalary.jsx, StaffList.jsx
  societies            | AddSociety, SocietyList, EditSociety, FeedPurchase
  feed_purchases       | FeedPurchase.jsx
  suppliers            | AddSupplier, SupplierList, EditSupplier
  supplier_purchases   | SupplierPurchase.jsx
  payments             | AddTransaction, TransactionHistory, EditTransaction
  inventory            | App.jsx (Dashboard feed stock)  ← THIS FILE
*/


-- ============================================================
-- SAMPLE DATA for Doctor Ledger (optional)
-- Replace 'YOUR_USER_ID' and 'YOUR_DOCTOR_ID' with real UUIDs
-- ============================================================
/*
INSERT INTO public.doctor_ledger (owner_id, doctor_id, date, reason, total_fee, paid_amount)
VALUES
  ('YOUR_USER_ID', 'YOUR_DOCTOR_ID', CURRENT_DATE, 'Regular Checkup',      500.00, 500.00),
  ('YOUR_USER_ID', 'YOUR_DOCTOR_ID', CURRENT_DATE - 7, 'Vaccination',      1200.00, 1000.00),
  ('YOUR_USER_ID', 'YOUR_DOCTOR_ID', CURRENT_DATE - 14, 'Deworming',       800.00, 0.00);
*/

-- Sample Inventory
/*
INSERT INTO public.inventory (owner_id, category, item_name, quantity, unit, min_stock)
VALUES
  ('YOUR_USER_ID', 'Feed',     'Cotton Cake',    150.00, 'Kg', 20),
  ('YOUR_USER_ID', 'Feed',     'Cattle Feed',    200.00, 'Kg', 50),
  ('YOUR_USER_ID', 'Feed',     'Khal',           100.00, 'Kg', 25),
  ('YOUR_USER_ID', 'Medicine', 'Vitamins',        10.00, 'Bottle', 2),
  ('YOUR_USER_ID', 'Medicine', 'Deworming Tabs',  50.00, 'Tabs', 10);
*/
