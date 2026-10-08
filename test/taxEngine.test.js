import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTax, TAX_BRACKETS } from '../src/utils/taxEngine.js';

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
