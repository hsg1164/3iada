-- ============================================================
-- Migration Script: Single Clinic to Multi-Tenant Platform
-- ============================================================

-- 1. Create the `clinics` table if it doesn't exist
CREATE TABLE IF NOT EXISTS clinics (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  name_en       TEXT,
  slug          TEXT NOT NULL UNIQUE,
  logo_url      TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  city          TEXT,
  description   TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  max_users     INTEGER DEFAULT 3,
  max_branches  INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Insert Default Clinic (Tenant 1) to associate existing data
INSERT INTO clinics (id, name, slug, subscription_plan) 
VALUES (1, 'العيادة الرئيسية', 'main', 'enterprise') 
ON CONFLICT DO NOTHING;

-- 3. Add `clinic_id` column to all existing tables (with default value 1)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

ALTER TABLE vaults ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE vault_transactions ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE routine_expenses ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

ALTER TABLE service_groups ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE supplier_debts ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

ALTER TABLE roles ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE staff_details ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

ALTER TABLE branches ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE referral_providers ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE tax_settings ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE working_days ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE holidays ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

ALTER TABLE prescription_templates ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE investigation_templates ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS clinic_id INTEGER NOT NULL DEFAULT 1 REFERENCES clinics(id) ON DELETE CASCADE;

-- 4. Fix constraints that need to include clinic_id
-- Patients: Drop old unique on local_code, and add a composite unique (clinic_id, local_code)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'patients_local_code_key'
    ) THEN
        ALTER TABLE patients DROP CONSTRAINT patients_local_code_key;
    END IF;
END $$;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_clinic_id_local_code_key;
ALTER TABLE patients ADD CONSTRAINT patients_clinic_id_local_code_key UNIQUE (clinic_id, local_code);

-- System Settings: Make clinic_id unique
ALTER TABLE system_settings DROP CONSTRAINT IF EXISTS system_settings_clinic_id_key;
ALTER TABLE system_settings ADD CONSTRAINT system_settings_clinic_id_key UNIQUE (clinic_id);

-- 5. Create specific Multi-Tenant Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_clinic_code ON patients(clinic_id, local_code);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic  ON appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_visits_clinic        ON visits(clinic_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_users_clinic         ON system_users(clinic_id);
