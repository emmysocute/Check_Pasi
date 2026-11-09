import { MONTH_NAMES_TH, calculateMonthlyTotals } from './monthlyTracker.js';

/**
 * Generates CSV content from 12 monthly tracker records with UTF-8 BOM for Thai Excel support.
 * @param {Array} records 
 * @param {number|string} year 
 * @returns {string}
 */
export function generateMonthlyTrackerCSV(records = [], year = 2569) {
  const totals = calculateMonthlyTotals(records);

  const headers = [
    'เดือน',
    'รายได้ (บาท)',
    'ภาษีหัก ณ ที่จ่าย 3% (บาท)',
    'เงินสมทบประกันสังคม (บาท)',
    'โน้ต / แหล่งที่มา',
  ];

  const rows = records.map((r, i) => {
    const monthName = MONTH_NAMES_TH[i] || `เดือนที่ ${r.month}`;
    const income = Number(r.income) || 0;
    const wht = Number(r.withholdingTax) || 0;
    const sso = Number(r.socialSecurity) || 0;
    const note = (r.note || '').replace(/"/g, '""');

    return `"${monthName}",${income},${wht},${sso},"${note}"`;
  });

  const summaryRow = `"รวมทั้งปี",${totals.totalIncome},${totals.totalWithholdingTax},${totals.totalSocialSecurity},""`;

  const csvBody = [
    `"รายงานสรุปรายได้และภาษีหัก ณ ที่จ่าย ประจำปีภาษี ${year} (TaxMe)"`,
    headers.join(','),
    ...rows,
    summaryRow,
  ].join('\r\n');

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel opens Thai characters cleanly
  return `\uFEFF${csvBody}`;
}

/**
 * Triggers a client-side file download of CSV in the browser.
 * @param {string} filename 
 * @param {string} csvContent 
 */
export function downloadCSV(filename, csvContent) {
  if (typeof window === 'undefined' || !window.Blob) return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
