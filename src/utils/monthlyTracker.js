/**
 * Utility functions and constants for 12-Month Monthly Income Tracker
 */

export const MONTH_NAMES_TH = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const MONTH_SHORT_TH = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function createDefaultMonthlyRecords() {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    withholdingTax: 0,
    socialSecurity: 0,
    note: '',
  }));
}

/**
 * Calculates sum totals from 12 monthly records.
 */
export function calculateMonthlyTotals(records = []) {
  return records.reduce(
    (acc, r) => {
      const inc = Math.max(0, Number(r.income) || 0);
      const wht = Math.max(0, Number(r.withholdingTax) || 0);
      const sso = Math.max(0, Number(r.socialSecurity) || 0);

      acc.totalIncome += inc;
      acc.totalWithholdingTax += wht;
      acc.totalSocialSecurity += sso;
      if (inc > 0 || wht > 0 || sso > 0) {
        acc.activeMonthsCount += 1;
      }
      return acc;
    },
    {
      totalIncome: 0,
      totalWithholdingTax: 0,
      totalSocialSecurity: 0,
      activeMonthsCount: 0,
    }
  );
}

/**
 * Computes 3% withholding tax helper shortcut.
 */
export function calculateQuick3Percent(income) {
  const num = Math.max(0, Number(income) || 0);
  return Math.round(num * 0.03);
}

/**
 * Quick estimated tax refund calculation for the monthly tracker sticky callout.
 */
export function estimateTrackerRefund({ totalIncome = 0, totalWithholdingTax = 0, totalSocialSecurity = 0 }) {
  const expenseDeduction = Math.min(totalIncome * 0.5, 100000);
  const personalAllowance = 60000;
  const ssoDeduction = Math.min(totalSocialSecurity, 9000);
  const netIncome = Math.max(0, totalIncome - expenseDeduction - personalAllowance - ssoDeduction);

  // Progressive tax calculation up to 300k bracket
  let tax = 0;
  if (netIncome > 150000) {
    tax = Math.min(netIncome - 150000, 150000) * 0.05;
  }
  if (netIncome > 300000) {
    tax += Math.min(netIncome - 300000, 200000) * 0.10;
  }
  if (netIncome > 500000) {
    tax += Math.min(netIncome - 500000, 250000) * 0.15;
  }

  const roundedTax = Math.round(tax);
  const netBalance = roundedTax - totalWithholdingTax;

  return {
    netIncome,
    estimatedTax: roundedTax,
    totalWithholdingTax,
    refundPotential: netBalance < 0 ? Math.abs(netBalance) : 0,
    payablePotential: netBalance > 0 ? netBalance : 0,
    status: netBalance < 0 ? 'refund' : (netBalance > 0 ? 'payable' : 'zero'),
  };
}
