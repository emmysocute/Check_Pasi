const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET /api/user/profile
// @desc    Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await db.query(
      `SELECT u.email, u.display_name, p.first_name, p.last_name, p.phone, p.address, p.tax_id 
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
  const { displayName, firstName, lastName, phone, address, taxId } = req.body;
  try {
    await db.query('UPDATE users SET display_name = $1, updated_at = NOW() WHERE id = $2', [displayName, req.user.id]);
    
    // Check if profile exists, if not, create it
    const profileCheck = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
    if(profileCheck.rows.length === 0) {
      await db.query(
        'INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, tax_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.id, firstName || '', lastName || '', phone || '', address || '', taxId || '']
      );
    } else {
      await db.query(
        'UPDATE user_profiles SET first_name = $1, last_name = $2, phone = $3, address = $4, tax_id = $5, updated_at = NOW() WHERE user_id = $6',
        [firstName || '', lastName || '', phone || '', address || '', taxId || '', req.user.id]
      );
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/user/change-password
// @desc    Change user password
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม' });
  }

  try {
    // Get user from database
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, req.user.id]);

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
