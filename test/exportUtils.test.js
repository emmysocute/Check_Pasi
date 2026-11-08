import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultMonthlyRecords } from '../src/utils/monthlyTracker.js';
import { generateMonthlyTrackerCSV } from '../src/utils/exportUtils.js';

test('generateMonthlyTrackerCSV generates valid CSV with UTF-8 BOM', () => {
  const records = createDefaultMonthlyRecords();
  records[0].income = 30000;
  records[0].withholdingTax = 900;
  records[0].note = 'งานฟรีแลนซ์ A';

  const csv = generateMonthlyTrackerCSV(records, 2569);

  // Check UTF-8 BOM
  assert.equal(csv.charCodeAt(0), 0xFEFF);

  // Check headers & title
  assert.ok(csv.includes('ปีภาษี 2569'));
  assert.ok(csv.includes('รายได้ (บาท)'));
  assert.ok(csv.includes('ภาษีหัก ณ ที่จ่าย 3% (บาท)'));

  // Check data row
  assert.ok(csv.includes('"มกราคม",30000,900,0,"งานฟรีแลนซ์ A"'));

  // Check summary row
  assert.ok(csv.includes('"รวมทั้งปี",30000,900,0,""'));
});
