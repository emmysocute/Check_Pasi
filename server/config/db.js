const { Pool } = require('pg');
const path = require('path');
// Load .env from both server folder and project root if present
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Determine SSL setting: disable for local/docker, enable for remote cloud database unless explicitly overridden
const isLocal = !process.env.DB_HOST || ['localhost', '127.0.0.1', 'postgres', 'taxme_db'].includes(process.env.DB_HOST);
const useSSL = process.env.DB_SSL === 'true' || (!isLocal && process.env.DB_SSL !== 'false');

// Create pool with individual connection parameters instead of connectionString
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taxme',
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

// Test connection with better error handling
const testConnection = async () => {
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
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('🔍 Connection config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
