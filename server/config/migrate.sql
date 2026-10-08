-- Migration Script for feat/tax-enhancements
-- Safe & Non-destructive (ใช้ IF NOT EXISTS ทั้งหมด)

-- 1. เพิ่มคอลัมน์ใน user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tax_id VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. เพิ่มคอลัมน์ใน users
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 3. เพิ่มคอลัมน์ใหม่ใน tax_records
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS freelance_income DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS personal_allowance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS spouse_allowance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS child_allowance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS insurance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS social_security DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS investment_fund DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS expense_deduction DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS withholding_tax DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS home_loan_interest DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_allowance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_own_father BOOLEAN DEFAULT false;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_own_mother BOOLEAN DEFAULT false;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_spouse_father BOOLEAN DEFAULT false;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_spouse_mother BOOLEAN DEFAULT false;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS donation DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS donation_education DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS donation_general DECIMAL(12,2) DEFAULT 0;
ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS tax_method VARCHAR(20) DEFAULT 'bracket';

-- 4. ตารางบันทึกรายได้ 12 เดือน (Monthly Tracker)
CREATE TABLE IF NOT EXISTS monthly_income_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  income DECIMAL(12,2) DEFAULT 0,
  withholding_tax DECIMAL(12,2) DEFAULT 0,
  social_security DECIMAL(12,2) DEFAULT 0,
  note TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tax_year, month)
);

-- 5. ตารางการตั้งค่าคอลัมน์ของ Monthly Tracker
CREATE TABLE IF NOT EXISTS monthly_tracker_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  show_withholding BOOLEAN DEFAULT true,
  show_social_security BOOLEAN DEFAULT false,
  show_note BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);
