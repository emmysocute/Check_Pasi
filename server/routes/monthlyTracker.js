const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

const sanitizeNum = (val, max = 999999999.99) => {
  const num = Number(val);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(num, max);
};

// @route   GET /api/monthly-tracker
// @desc    Get 12-month records and column settings for a specific tax year
router.get('/', auth, async (req, res) => {
  try {
    const rawYear = parseInt(req.query.year, 10);
    const taxYear = !isNaN(rawYear) && rawYear > 1900 ? rawYear : new Date().getFullYear();

    // 1. Fetch user column settings
    const settingsRes = await db.query(
      'SELECT show_withholding, show_social_security, show_note FROM monthly_tracker_settings WHERE user_id = $1',
      [req.user.id]
    );

    const settings = settingsRes.rows.length > 0 ? {
      showWithholding: Boolean(settingsRes.rows[0].show_withholding),
      showSocialSecurity: Boolean(settingsRes.rows[0].show_social_security),
      showNote: Boolean(settingsRes.rows[0].show_note)
    } : {
      showWithholding: true,
      showSocialSecurity: false,
      showNote: false
    };

    // 2. Fetch monthly records for the requested tax year
    const recordsRes = await db.query(
      'SELECT month, income, withholding_tax, social_security, note FROM monthly_income_records WHERE user_id = $1 AND tax_year = $2 ORDER BY month ASC',
      [req.user.id, taxYear]
    );

    const recordMap = {};
    recordsRes.rows.forEach(r => {
      recordMap[r.month] = {
        month: r.month,
        income: Number(r.income) || 0,
        withholdingTax: Number(r.withholding_tax) || 0,
        socialSecurity: Number(r.social_security) || 0,
        note: r.note || ''
      };
    });

    // Ensure all 12 months (1..12) are represented
    const records = [];
    for (let m = 1; m <= 12; m++) {
      if (recordMap[m]) {
        records.push(recordMap[m]);
      } else {
        records.push({
          month: m,
          income: 0,
          withholdingTax: 0,
          socialSecurity: 0,
          note: ''
        });
      }
    }

    res.json({
      year: taxYear,
      records,
      settings
    });
  } catch (err) {
    console.error('Fetch monthly tracker error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายเดือน' });
  }
});

// @route   POST /api/monthly-tracker
// @desc    Bulk save/upsert 12-month records and column settings
router.post('/', auth, async (req, res) => {
  const { year, records, settings } = req.body;

  try {
    const rawYear = parseInt(year, 10);
    const taxYear = !isNaN(rawYear) && rawYear > 1900 ? rawYear : new Date().getFullYear();

    // 1. Upsert column settings if provided
    let updatedSettings = {
      showWithholding: true,
      showSocialSecurity: false,
      showNote: false
    };

    if (settings && typeof settings === 'object') {
      const showWithholding = settings.showWithholding !== undefined ? Boolean(settings.showWithholding) : true;
      const showSocialSecurity = Boolean(settings.showSocialSecurity);
      const showNote = Boolean(settings.showNote);

      await db.query(
        `INSERT INTO monthly_tracker_settings (user_id, show_withholding, show_social_security, show_note, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           show_withholding = EXCLUDED.show_withholding,
           show_social_security = EXCLUDED.show_social_security,
           show_note = EXCLUDED.show_note,
           updated_at = NOW()`,
        [req.user.id, showWithholding, showSocialSecurity, showNote]
      );

      updatedSettings = {
        showWithholding,
        showSocialSecurity,
        showNote
      };
    }

    // 2. Upsert monthly records
    if (Array.isArray(records)) {
      for (const item of records) {
        const month = parseInt(item.month, 10);
        if (month >= 1 && month <= 12) {
          const income = sanitizeNum(item.income);
          const withholdingTax = sanitizeNum(item.withholdingTax);
          const socialSecurity = sanitizeNum(item.socialSecurity);
          const note = String(item.note || '').slice(0, 500);

          await db.query(
            `INSERT INTO monthly_income_records (user_id, tax_year, month, income, withholding_tax, social_security, note, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (user_id, tax_year, month) DO UPDATE SET
               income = EXCLUDED.income,
               withholding_tax = EXCLUDED.withholding_tax,
               social_security = EXCLUDED.social_security,
               note = EXCLUDED.note,
               updated_at = NOW()`,
            [req.user.id, taxYear, month, income, withholdingTax, socialSecurity, note]
          );
        }
      }
    }

    // 3. Return canonical updated state
    const recordsRes = await db.query(
      'SELECT month, income, withholding_tax, social_security, note FROM monthly_income_records WHERE user_id = $1 AND tax_year = $2 ORDER BY month ASC',
      [req.user.id, taxYear]
    );

    const recordMap = {};
    recordsRes.rows.forEach(r => {
      recordMap[r.month] = {
        month: r.month,
        income: Number(r.income) || 0,
        withholdingTax: Number(r.withholding_tax) || 0,
        socialSecurity: Number(r.social_security) || 0,
        note: r.note || ''
      };
    });

    const canonicalRecords = [];
    for (let m = 1; m <= 12; m++) {
      canonicalRecords.push(recordMap[m] || {
        month: m,
        income: 0,
        withholdingTax: 0,
        socialSecurity: 0,
        note: ''
      });
    }

    res.json({
      message: 'บันทึกข้อมูลรายเดือนเรียบร้อยแล้ว',
      year: taxYear,
      records: canonicalRecords,
      settings: updatedSettings
    });
  } catch (err) {
    console.error('Save monthly tracker error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลรายเดือน' });
  }
});

module.exports = router;
