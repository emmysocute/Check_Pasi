const { Pool } = require('pg');
const path = require('path');
// Load .env from both server folder and project root if present
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Determine SSL setting: disable for local/docker, enable for remote cloud database unless explicitly overridden
const isLocal = !process.env.DB_HOST || ['localhost', '127.0.0.1', 'postgres', 'taxme_db'].includes(process.env.DB_HOST);
const useSSL = process.env.DB_SSL === 'true' || (!isLocal && process.env.DB_SSL !== 'false');

// Determine host: if set to 'postgres' outside docker container, fallback to 'localhost'
const hostConfig = (process.env.DB_HOST === 'postgres' && process.platform === 'win32')
  ? 'localhost'
  : (process.env.DB_HOST || 'localhost');

// Create pool with individual connection parameters instead of connectionString
const pool = new Pool({
  host: hostConfig,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taxme',
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

// Run non-destructive automatic database migrations
const runMigrations = async () => {
  const migrations = [
    // 1. ตาราง users
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    // 2. ตาราง tax_records
    `CREATE TABLE IF NOT EXISTS tax_records (
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
    )`,
    // 3. ตาราง user_profiles
    `CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone VARCHAR(20),
      address TEXT,
      tax_id VARCHAR(20),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    // 4. เพิ่มคอลัมน์ใน user_profiles กรณีตารางถูกสร้างไว้ก่อนหน้านี้แล้วยังไม่มีคอลัมน์ใหม่
    `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`,
    `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`,
    `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`,
    `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tax_id VARCHAR(20)`,
    `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,
    // 5. ป้องกันกรณี users หรือ tax_records ขาดคอลัมน์
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS freelance_income DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS personal_allowance DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS spouse_allowance DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS child_allowance DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS insurance DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS social_security DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS investment_fund DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS expense_deduction DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS withholding_tax DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS home_loan_interest DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_allowance DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_own_father BOOLEAN DEFAULT false`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_own_mother BOOLEAN DEFAULT false`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_spouse_father BOOLEAN DEFAULT false`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS parent_spouse_mother BOOLEAN DEFAULT false`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS donation DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS donation_education DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS donation_general DECIMAL(12,2) DEFAULT 0`,
    `ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS tax_method VARCHAR(20) DEFAULT 'bracket'`,
    // 6. ตาราง monthly_income_records (บันทึกรายได้ 12 เดือน)
    `CREATE TABLE IF NOT EXISTS monthly_income_records (
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
    )`,
    // 7. ตาราง monthly_tracker_settings (การตั้งค่าแสดงผลคอลัมน์)
    `CREATE TABLE IF NOT EXISTS monthly_tracker_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      show_withholding BOOLEAN DEFAULT true,
      show_social_security BOOLEAN DEFAULT false,
      show_note BOOLEAN DEFAULT false,
      updated_at TIMESTAMP DEFAULT NOW()
    )`
  ];

  console.log('🔄 Checking and running database migrations...');
  for (const sql of migrations) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error('⚠️ Database migration warning:', err.message);
    }
  }
  console.log('✅ Database schema verified and up-to-date');
};

// Test connection with retry loop for containerized environment
const testConnection = async (maxRetries = 10, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      console.log('✅ Database connected successfully');
      console.log('📊 Connected to:', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      });
      client.release();
      await runMigrations();
      return;
    } catch (err) {
      console.warn(`⏳ Waiting for database to be ready (attempt ${attempt}/${maxRetries}): ${err.message}`);
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, delayMs));
      } else {
        console.error('❌ Database connection failed after maximum retries');
      }
    }
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
