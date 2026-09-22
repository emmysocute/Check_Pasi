const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET /api/user/profile
// @desc    Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await db.query(
      `SELECT u.email, u.display_name, p.phone, p.address, p.tax_id 
       FROM users u 
       LEFT JOIN user_profiles p ON u.id = p.user_id 
       WHERE u.id = $1`, 
      [req.user.id]
    );
    res.json(profile.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
router.put('/profile', auth, async (req, res) => {
  const { displayName, phone, address, taxId } = req.body;
  try {
    await db.query('UPDATE users SET display_name = $1 WHERE id = $2', [displayName, req.user.id]);
    
    // Check if profile exists, if not, create it
    const profileCheck = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
    if(profileCheck.rows.length === 0) {
        await db.query('INSERT INTO user_profiles (user_id) VALUES ($1)', [req.user.id]);
    }

    await db.query(
      'UPDATE user_profiles SET phone = $1, address = $2, tax_id = $3, updated_at = NOW() WHERE user_id = $4',
      [phone, address, taxId, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
