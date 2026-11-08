import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultMonthlyRecords,
  calculateMonthlyTotals,
  calculateQuick3Percent,
  estimateTrackerRefund,
  QUARTERS,
  filterRecordsByQuarter,
  calculateQuarterSummaries,
} from '../src/utils/monthlyTracker.js';

test('createDefaultMonthlyRecords creates 12 default month entries', () => {
  const records = createDefaultMonthlyRecords();
  assert.equal(records.length, 12);
  assert.equal(records[0].month, 1);
  assert.equal(records[11].month, 12);
  assert.equal(records[0].income, 0);
  assert.equal(records[0].withholdingTax, 0);
  assert.equal(records[0].socialSecurity, 0);
  assert.equal(records[0].note, '');
});

test('calculateMonthlyTotals aggregates sums and active months count', () => {
  const records = createDefaultMonthlyRecords();
  records[0].income = 25000;
  records[0].withholdingTax = 750;
  records[0].socialSecurity = 750;

  records[1].income = 30000;
  records[1].withholdingTax = 900;
  records[1].socialSecurity = 750;

  const totals = calculateMonthlyTotals(records);
  assert.equal(totals.totalIncome, 55000);
  assert.equal(totals.totalWithholdingTax, 1650);
  assert.equal(totals.totalSocialSecurity, 1500);
  assert.equal(totals.activeMonthsCount, 2);
});

test('calculateQuick3Percent returns rounded 3% of income', () => {
  assert.equal(calculateQuick3Percent(10000), 300);
  assert.equal(calculateQuick3Percent(25000), 750);
  assert.equal(calculateQuick3Percent(33333), 1000);
  assert.equal(calculateQuick3Percent(0), 0);
  assert.equal(calculateQuick3Percent(-5000), 0);
});

test('estimateTrackerRefund calculates refund potential correctly', () => {
  // Total income 300,000 (Expense 100k, Personal 60k, SSO 9k -> Net 131,000 <= 150,000 tax-free)
  // WHT was 9,000 -> full refund 9,000 THB!
  const refundCase = estimateTrackerRefund({
    totalIncome: 300000,
    totalWithholdingTax: 9000,
    totalSocialSecurity: 9000,
  });

  assert.equal(refundCase.estimatedTax, 0);
  assert.equal(refundCase.refundPotential, 9000);
  assert.equal(refundCase.status, 'refund');

  // Higher income case: Net = 300,000 -> Tax = 7,500. WHT = 2,000 -> Payable = 5,500.
  const payableCase = estimateTrackerRefund({
    totalIncome: 460000, // 460k - 100k - 60k = 300k net
    totalWithholdingTax: 2000,
    totalSocialSecurity: 0,
  });

  assert.equal(payableCase.estimatedTax, 7500);
  assert.equal(payableCase.payablePotential, 5500);
  assert.equal(payableCase.status, 'payable');
});

test('filterRecordsByQuarter returns correct months for each quarter', () => {
  const records = createDefaultMonthlyRecords();
  assert.equal(filterRecordsByQuarter(records, 'ALL').length, 12);

  const q1 = filterRecordsByQuarter(records, 'Q1');
  assert.equal(q1.length, 3);
  assert.deepEqual(q1.map(r => r.month), [1, 2, 3]);

  const q2 = filterRecordsByQuarter(records, 'Q2');
  assert.equal(q2.length, 3);
  assert.deepEqual(q2.map(r => r.month), [4, 5, 6]);

  const q3 = filterRecordsByQuarter(records, 'Q3');
  assert.equal(q3.length, 3);
  assert.deepEqual(q3.map(r => r.month), [7, 8, 9]);

  const q4 = filterRecordsByQuarter(records, 'Q4');
  assert.equal(q4.length, 3);
  assert.deepEqual(q4.map(r => r.month), [10, 11, 12]);
});

test('QUARTERS constant defines all four quarters plus ALL option', () => {
  assert.equal(QUARTERS.length, 5);
  assert.deepEqual(QUARTERS.map(q => q.id), ['ALL', 'Q1', 'Q2', 'Q3', 'Q4']);
});

test('calculateQuarterSummaries calculates subtotals per quarter accurately', () => {
  const records = createDefaultMonthlyRecords();
  records[0].income = 10000; // Jan (Q1)
  records[1].income = 20000; // Feb (Q1)
  records[3].income = 40000; // Apr (Q2)

  const summaries = calculateQuarterSummaries(records);
  assert.equal(summaries.Q1.totalIncome, 30000);
  assert.equal(summaries.Q2.totalIncome, 40000);
  assert.equal(summaries.Q3.totalIncome, 0);
  assert.equal(summaries.Q4.totalIncome, 0);
});
