const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create pool with individual connection parameters instead of connectionString
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'taxme',
});

// Test connection with better error handling
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    console.log('📊 Connected to:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'taxme',
      user: process.env.DB_USER || 'postgres'
    });
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('🔍 Connection config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'taxme',
      user: process.env.DB_USER || 'postgres'
    });
  }
};

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
