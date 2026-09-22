const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
  console.log('Register attempt:', req.body);
  const { email, password, displayName } = req.body;
  
  try {
    console.log('Checking if user exists:', email);
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('User check result:', userCheck.rows.length, 'existing users');
    
    if (userCheck.rows.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    console.log('Creating new user...');
    const newUser = await db.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
      [email, passwordHash, displayName]
    );
    console.log('User created:', newUser.rows[0]);

    // Create profile
    console.log('Creating user profile...');
    await db.query('INSERT INTO user_profiles (user_id) VALUES ($1)', [newUser.rows[0].id]);
    console.log('Profile created successfully');

    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    const payload = { user: { id: newUser.rows[0].id } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT sign error:', err);
        throw err;
      }
      console.log('Registration successful, token generated');
      res.json({ token, user: newUser.rows[0] });
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    console.error('Full error:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;
  
  try {
    console.log('Looking for user with email:', email);
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('Query result:', result.rows.length, 'users found');
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
    const payload = { user: { id: user.id } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT sign error:', err);
        throw err;
      }
      console.log('Login successful, token generated');
      res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name } });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    console.error('Full error:', err);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.query('SELECT id, email, display_name FROM users WHERE id = $1', [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
