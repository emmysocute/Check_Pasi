-- ตาราง users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง tax_records (บันทึกการคำนวณ)
CREATE TABLE tax_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    monthly_income DECIMAL(12,2),
    freelance_income DECIMAL(12,2) DEFAULT 0,
    employment_type VARCHAR(50),
    personal_allowance DECIMAL(12,2) DEFAULT 0,
    spouse_allowance DECIMAL(12,2) DEFAULT 0,
    child_allowance DECIMAL(12,2) DEFAULT 0,
    insurance DECIMAL(12,2) DEFAULT 0,
    social_security DECIMAL(12,2) DEFAULT 0,
    investment_fund DECIMAL(12,2) DEFAULT 0,
    annual_income DECIMAL(12,2),
    expense_deduction DECIMAL(12,2) DEFAULT 0,
    total_deduction DECIMAL(12,2),
    net_income DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    withholding_tax DECIMAL(12,2) DEFAULT 0,
    home_loan_interest DECIMAL(12,2) DEFAULT 0,
    parent_allowance DECIMAL(12,2) DEFAULT 0,
    parent_own_father BOOLEAN DEFAULT false,
    parent_own_mother BOOLEAN DEFAULT false,
    parent_spouse_father BOOLEAN DEFAULT false,
    parent_spouse_mother BOOLEAN DEFAULT false,
    donation DECIMAL(12,2) DEFAULT 0,
    donation_education DECIMAL(12,2) DEFAULT 0,
    donation_general DECIMAL(12,2) DEFAULT 0,
    tax_method VARCHAR(20) DEFAULT 'bracket',
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง user_profiles (ข้อมูลเพิ่มเติม)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(20),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง monthly_income_records (บันทึกรายได้ 12 เดือน)
CREATE TABLE monthly_income_records (
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

-- ตาราง monthly_tracker_settings (การตั้งค่าการแสดงผลคอลัมน์)
CREATE TABLE monthly_tracker_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    show_withholding BOOLEAN DEFAULT true,
    show_social_security BOOLEAN DEFAULT false,
    show_note BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT NOW()
);

