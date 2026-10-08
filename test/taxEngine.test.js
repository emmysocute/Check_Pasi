import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTax, calculateTaxFromFormData, TAX_BRACKETS } from '../src/utils/taxEngine.js';

test('Tax Brackets Definition', () => {
  assert.equal(TAX_BRACKETS.length, 8);
  assert.equal(TAX_BRACKETS[0].rate, 0);
  assert.equal(TAX_BRACKETS[1].rate, 0.05);
  assert.equal(TAX_BRACKETS[7].rate, 0.35);
});

test('Scenario 1: Net income 150,000 THB is tax-free (0%)', () => {
  // Salary 25,000/mo = 300,000/yr. Expense = 100,000. Deductions = 60,000 (personal). Net = 140,000.
  const result = calculateTax({
    monthlyIncome: 25000,
    freelanceIncome: 0,
    personalAllowance: 60000,
    socialSecurity: 0,
  });

  assert.equal(result.sumIncome, 300000);
  assert.equal(result.expenseDeduction, 100000);
  assert.equal(result.totalDeduction, 60000);
  assert.equal(result.netIncome, 140000);
  assert.equal(result.finalTax, 0);
  assert.equal(result.marginalRate, 0);
});

test('Scenario 2: Progressive tax calculation across brackets', () => {
  // Salary 50,000/mo = 600,000/yr. Expense = 100,000. Personal = 60,000. SSO = 9,000.
  // Net = 600,000 - 100,000 - 69,000 = 431,000 THB.
  // Brackets:
  // 0 - 150,000 @ 0% = 0
  // 150,001 - 300,000 (150,000) @ 5% = 7,500
  // 300,001 - 431,000 (131,000) @ 10% = 13,100
  // Total Tax = 20,600 THB.
  const result = calculateTax({
    monthlyIncome: 50000,
    freelanceIncome: 0,
    personalAllowance: 60000,
    socialSecurity: 9000,
  });

  assert.equal(result.netIncome, 431000);
  assert.equal(result.finalTax, 20600);
  assert.equal(result.marginalRate, 0.10);
});

test('Scenario 3: Caps enforcement for insurance, social security and RMF', () => {
  const result = calculateTax({
    monthlyIncome: 100000, // 1,200,000/yr
    freelanceIncome: 0,
    personalAllowance: 60000,
    insurance: 250000, // should cap at 100,000
    socialSecurity: 20000, // should cap at 9,000
    investmentFund: 600000, // should cap at min(1,200,000*0.3, 500,000) = 360,000
  });

  assert.equal(result.itemizedDeductions.insurance, 100000);
  assert.equal(result.itemizedDeductions.socialSecurity, 9000);
  assert.equal(result.itemizedDeductions.investmentFund, 360000);
  assert.equal(result.totalDeduction, 60000 + 100000 + 9000 + 360000);
});

test('Scenario 4: Defensive bounds on negative numbers', () => {
  const result = calculateTax({
    monthlyIncome: -50000,
    freelanceIncome: -20000,
    insurance: -10000,
  });

  assert.equal(result.sumIncome, 0);
  assert.equal(result.expenseDeduction, 0);
  assert.equal(result.finalTax, 0);
  assert.equal(result.netIncome, 0);
});

test('Scenario 5: Withholding Tax and Tax Refund vs Payable', () => {
  // Case A: Withholding tax > final tax -> Refund
  const refundResult = calculateTax({
    monthlyIncome: 50000, // tax = 20,600
    freelanceIncome: 0,
    personalAllowance: 60000,
    socialSecurity: 9000,
    withholdingTax: 30000,
  });
  assert.equal(refundResult.finalTax, 20600);
  assert.equal(refundResult.withholdingTax, 30000);
  assert.equal(refundResult.status, 'refund');
  assert.equal(refundResult.refundAmount, 9400);
  assert.equal(refundResult.payableAmount, 0);

  // Case B: Withholding tax < final tax -> Payable
  const payableResult = calculateTax({
    monthlyIncome: 50000, // tax = 20,600
    freelanceIncome: 0,
    personalAllowance: 60000,
    socialSecurity: 9000,
    withholdingTax: 15000,
  });
  assert.equal(payableResult.finalTax, 20600);
  assert.equal(payableResult.withholdingTax, 15000);
  assert.equal(payableResult.status, 'payable');
  assert.equal(payableResult.refundAmount, 0);
  assert.equal(payableResult.payableAmount, 5600);
});

test('Scenario 6: Extended deductions (Home loan cap, parents, donations)', () => {
  const result = calculateTax({
    monthlyIncome: 80000, // 960,000/yr. Expense = 100,000.
    personalAllowance: 60000,
    socialSecurity: 9000,
    homeLoanInterest: 140000, // should cap at 100,000
    parentAllowance: 60000, // 2 parents = 60,000
    donationEducation: 10000, // 10,000 * 2 = 20,000
    donationGeneral: 5000, // 5,000 -> Total eligible donation = 25,000
  });

  assert.equal(result.itemizedDeductions.homeLoanInterest, 100000);
  assert.equal(result.itemizedDeductions.parentAllowance, 60000);
  assert.equal(result.itemizedDeductions.donation, 25000);
  // Total deduction = 60,000 + 9,000 + 100,000 + 60,000 + 25,000 = 254,000
  assert.equal(result.totalDeduction, 254000);
  // Net income = 960,000 - 100,000 - 254,000 = 606,000
  assert.equal(result.netIncome, 606000);
});

test('Scenario 7: Section 48(2) Flat Rate Tax (0.5%) evaluation for freelance income > 120,000', () => {
  // Case A: Freelance 1,050,000 with high deductions such that progressive tax is small (1,500 THB)
  // Flat rate 0.5% = 5,250 THB (> 5,000 THB and > bracket tax 1,500 THB) -> taxMethod: 'flat_rate'
  const flatResult = calculateTax({
    monthlyIncome: 0,
    freelanceIncome: 1050000,
    personalAllowance: 60000,
    spouseAllowance: 60000,
    childAllowance: 150000,
    parentAllowance: 60000,
    homeLoanInterest: 100000,
    insurance: 100000,
    investmentFund: 240000,
    socialSecurity: 0,
  });

  assert.equal(flatResult.netIncome, 180000);
  assert.equal(flatResult.bracketTax, 1500);
  assert.equal(flatResult.flatRateTax, 5250);
  assert.equal(flatResult.taxMethod, 'flat_rate');
  assert.equal(flatResult.finalTax, 5250);

  // Case B: Freelance 800,000 where flat rate 0.5% is 4,000 THB (<= 5,000 THB)
  // Revenue Code exempts flat rate if <= 5,000 -> remains 'bracket'
  const waivedResult = calculateTax({
    monthlyIncome: 0,
    freelanceIncome: 800000,
  });
  assert.equal(waivedResult.flatRateTax, 4000);
  assert.equal(waivedResult.taxMethod, 'bracket');
});

test('Scenario 8: Bracket breakdown details and marginal tax rate', () => {
  const result = calculateTax({
    monthlyIncome: 40000, // 480,000/yr. Expense = 100,000. Deductions = 60,000.
    personalAllowance: 60000,
    // Net = 480,000 - 100,000 - 60,000 = 320,000 THB
  });

  assert.equal(result.brackets.length, 8);
  // Bracket 0-150k: taxable 150,000, tax 0
  assert.equal(result.brackets[0].taxable, 150000);
  assert.equal(result.brackets[0].tax, 0);
  // Bracket 150k-300k: taxable 150,000, tax 7,500
  assert.equal(result.brackets[1].taxable, 150000);
  assert.equal(result.brackets[1].tax, 7500);
  // Bracket 300k-500k: taxable 20,000, tax 2,000
  assert.equal(result.brackets[2].taxable, 20000);
  assert.equal(result.brackets[2].tax, 2000);
  // Marginal rate should be 10% (0.10)
  assert.equal(result.marginalRate, 0.10);
});

test('Scenario 9: Parental allowance checkbox selection permutations (0 to 4 parents)', () => {
  // 1 parent (own father only)
  const oneParent = calculateTaxFromFormData({
    monthlyIncome: 30000,
    parentAllowance: { enabled: true, ownFather: true, ownMother: false, spouseFather: false, spouseMother: false }
  });
  assert.equal(oneParent.itemizedDeductions.parentAllowance, 30000);

  // 2 parents (own father + own mother)
  const twoParents = calculateTaxFromFormData({
    monthlyIncome: 30000,
    parentAllowance: { enabled: true, ownFather: true, ownMother: true, spouseFather: false, spouseMother: false }
  });
  assert.equal(twoParents.itemizedDeductions.parentAllowance, 60000);

  // 4 parents (all 4 checked)
  const fourParents = calculateTaxFromFormData({
    monthlyIncome: 30000,
    parentAllowance: { enabled: true, ownFather: true, ownMother: true, spouseFather: true, spouseMother: true }
  });
  assert.equal(fourParents.itemizedDeductions.parentAllowance, 120000);

  // Enabled is false -> 0 THB
  const disabled = calculateTaxFromFormData({
    monthlyIncome: 30000,
    parentAllowance: { enabled: false, ownFather: true, ownMother: true }
  });
  assert.equal(disabled.itemizedDeductions.parentAllowance, 0);
});

test('Scenario 10: Dual-rate donation calculation and statutory 10% net income cap', () => {
  // Case A: 2x Education + 1x General within 10% cap
  // Monthly income: 100,000 -> Annual 1,200,000. Expense: 100,000. Personal: 60,000. Social Security: 9,000.
  // Pre-donation net income = 1,200,000 - 100,000 - 69,000 = 1,031,000 THB.
  // 10% cap = 103,100 THB.
  // Donation: Education 20,000 (2x = 40,000), General 10,000 (1x = 10,000). Total eligible = 50,000 (< 103,100).
  const resultWithinCap = calculateTaxFromFormData({
    monthlyIncome: 100000,
    personalAllowance: { enabled: true, amount: 60000 },
    socialSecurity: { enabled: true, amount: 9000 },
    donationEducation: { enabled: true, amount: 20000 },
    donationGeneral: { enabled: true, amount: 10000 },
  });

  assert.equal(resultWithinCap.remainingBeforeDonation, 1031000);
  assert.equal(resultWithinCap.maxDonationCap, 103100);
  assert.equal(resultWithinCap.rawDonationClaim, 50000);
  assert.equal(resultWithinCap.itemizedDeductions.donation, 50000);
  assert.equal(resultWithinCap.netIncome, 1031000 - 50000);

  // Case B: Donation exceeds 10% pre-donation net income cap
  // Pre-donation net income = 1,031,000 THB -> 10% cap = 103,100 THB.
  // Education donation = 100,000 (2x = 200,000). Capped at 103,100 THB!
  const resultExceedingCap = calculateTaxFromFormData({
    monthlyIncome: 100000,
    personalAllowance: { enabled: true, amount: 60000 },
    socialSecurity: { enabled: true, amount: 9000 },
    donationEducation: { enabled: true, amount: 100000 },
    donationGeneral: { enabled: false, amount: 0 },
  });

  assert.equal(resultExceedingCap.remainingBeforeDonation, 1031000);
  assert.equal(resultExceedingCap.maxDonationCap, 103100);
  assert.equal(resultExceedingCap.rawDonationClaim, 200000);
  assert.equal(resultExceedingCap.itemizedDeductions.donation, 103100);
  assert.equal(resultExceedingCap.netIncome, 1031000 - 103100);

  // Case C: Disabled donation flags yield 0 THB
  const resultDisabled = calculateTaxFromFormData({
    monthlyIncome: 100000,
    personalAllowance: { enabled: true, amount: 60000 },
    donationEducation: { enabled: false, amount: 50000 },
    donationGeneral: { enabled: false, amount: 20000 },
  });

  assert.equal(resultDisabled.itemizedDeductions.donation, 0);
  assert.equal(resultDisabled.rawDonationClaim, 0);
});

test('Scenario 11: Donation 10% ceiling boundary when remaining income is zero or low', () => {
  // If income after expenses and deductions is 0, maxDonationCap must be 0
  const zeroRemaining = calculateTax({
    monthlyIncome: 10000, // 120,000/yr. Expense: 60,000. Personal: 60,000.
    personalAllowance: 60000,
    donationGeneral: 5000,
  });
  assert.equal(zeroRemaining.remainingBeforeDonation, 0);
  assert.equal(zeroRemaining.maxDonationCap, 0);
  assert.equal(zeroRemaining.rawDonationClaim, 5000);
  assert.equal(zeroRemaining.itemizedDeductions.donation, 0);

  // If income is 20,000/mo -> 240,000/yr. Expense: 100,000. Personal: 60,000.
  // Remaining = 80,000. 10% cap = 8,000.
  const lowRemaining = calculateTax({
    monthlyIncome: 20000,
    personalAllowance: 60000,
    donationGeneral: 10000,
  });
  assert.equal(lowRemaining.remainingBeforeDonation, 80000);
  assert.equal(lowRemaining.maxDonationCap, 8000);
  assert.equal(lowRemaining.rawDonationClaim, 10000);
  assert.equal(lowRemaining.itemizedDeductions.donation, 8000);
});



