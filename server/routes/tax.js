const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

const toNonNegative = (val, max = 999999999.99) => {
  const num = Number(val);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(num, max);
};

// @route   POST /api/tax/calculate
// @desc    Save tax calculation
router.post('/calculate', auth, async (req, res) => {
  const {
    monthlyIncome, freelanceIncome, withholdingTax, employmentType, personalAllowance, spouseAllowance, 
    childAllowance, insurance, socialSecurity, investmentFund,
    homeLoanInterest, parentAllowance, donation,
    annualIncome, expenseDeduction, totalDeduction, netIncome, taxAmount
  } = req.body;

  try {
    const cleanMonthly = toNonNegative(monthlyIncome);
    const cleanFreelance = toNonNegative(freelanceIncome);
    const cleanWithholding = toNonNegative(withholdingTax);
    const cleanEmployment = String(employmentType || 'salary').slice(0, 50);
    const cleanPersonal = toNonNegative(personalAllowance, 60000);
    const cleanSpouse = toNonNegative(spouseAllowance, 60000);
    const cleanChild = toNonNegative(childAllowance);
    const cleanInsurance = toNonNegative(insurance, 100000); // กฎหมายสรรพากร cap ไม่เกิน 100,000 บ.
    const cleanSocialSecurity = toNonNegative(socialSecurity, 9000); // ปกติ ม.33 cap ไม่เกิน 9,000 บ.
    const cleanInvestment = toNonNegative(investmentFund, 500000);
    const cleanHomeLoan = toNonNegative(homeLoanInterest, 100000);
    const cleanParent = toNonNegative(parentAllowance, 120000);
    const cleanDonation = toNonNegative(donation);
    const cleanAnnual = toNonNegative(annualIncome);
    const cleanExpense = toNonNegative(expenseDeduction, 100000);
    const cleanTotalDeduction = toNonNegative(totalDeduction);
    const cleanNet = toNonNegative(netIncome);
    const cleanTax = toNonNegative(taxAmount);

    const result = await db.query(
      `INSERT INTO tax_records (
        user_id, monthly_income, freelance_income, withholding_tax, employment_type, personal_allowance, 
        spouse_allowance, child_allowance, insurance, social_security, 
        investment_fund, home_loan_interest, parent_allowance, donation,
        annual_income, expense_deduction, total_deduction, net_income, tax_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [
        req.user.id, cleanMonthly, cleanFreelance, cleanWithholding, cleanEmployment, cleanPersonal,
        cleanSpouse, cleanChild, cleanInsurance, cleanSocialSecurity,
        cleanInvestment, cleanHomeLoan, cleanParent, cleanDonation,
        cleanAnnual, cleanExpense, cleanTotalDeduction, cleanNet, cleanTax
      ]
    );
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Save tax error:', err.message);
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
