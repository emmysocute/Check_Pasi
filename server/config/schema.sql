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
    total_deduction DECIMAL(12,2),
    net_income DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง user_profiles (ข้อมูลเพิ่มเติม)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(20),
    updated_at TIMESTAMP DEFAULT NOW()
);
