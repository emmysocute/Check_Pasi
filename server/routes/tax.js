const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// @route   POST /api/tax/calculate
// @desc    Save tax calculation
router.post('/calculate', auth, async (req, res) => {
  const {
    monthlyIncome, freelanceIncome, employmentType, personalAllowance, spouseAllowance, 
    childAllowance, insurance, socialSecurity, investmentFund,
    annualIncome, totalDeduction, netIncome, taxAmount
  } = req.body;
  console.log(req.body)
  try {
    const result = await db.query(
      `INSERT INTO tax_records (
        user_id, monthly_income, freelance_income, employment_type, personal_allowance, 
        spouse_allowance, child_allowance, insurance, social_security, 
        investment_fund, annual_income, total_deduction, net_income, tax_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        req.user.id, monthlyIncome, freelanceIncome, employmentType, personalAllowance,
        spouseAllowance, childAllowance, insurance, socialSecurity,
        investmentFund, annualIncome, totalDeduction, netIncome, taxAmount
      ]
    );
    console.log("result", result.rows[0])
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tax/history
// @desc    Get user tax history
router.get('/history', auth, async (req, res) => {
  try {
    const records = await db.query(
      'SELECT * FROM tax_records WHERE user_id = $1 ORDER BY calculated_at DESC',
      [req.user.id]
    );
    res.json(records.rows);
    console.log(records.rows)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/tax/history/:id
// @desc    Delete a tax record
router.delete('/history/:id', auth, async (req, res) => {
  try {
    // Ensure the record belongs to the user
    const check = await db.query('SELECT * FROM tax_records WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found or not authorized' });
    }
    
    await db.query('DELETE FROM tax_records WHERE id = $1', [req.params.id]);
    res.json({ message: 'Record deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
