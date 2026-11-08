# 04: ภ.ง.ด. 90/91 Pre-Filing Cheat Sheet & Clean Print Layout

**What to build:** In `TaxCalculatorPage.jsx` and `ResultPanel.jsx`, provide a "เปิดใบสรุปเตรียมยื่นแบบ ภ.ง.ด. 90/91" modal action that maps every calculated tax parameter directly to the corresponding statutory box on the Thai Revenue Department e-Filing portal (`rd.go.th`). Include a dedicated `@media print` stylesheet that produces a clean, professional A4 summary sheet for filing records.

**Blocked by:** 03 (Tax Saving Advisor & What-If Deduction Simulator)

**Status:** completed

- [x] Create a dedicated `PreFilingSheetModal` component itemizing figures according to Revenue Department statutory forms:
  - Income Section 40(1) (เงินเดือน) and Section 40(2) (รับจ้าง/ฟรีแลนซ์)
  - 50% Standard Expense Deduction
  - Deductions categorized into statutory 4 groups (Family, Insurance/Savings, Housing, Donations)
  - Withholding tax credit and final net tax payable / refundable
- [x] Provide a "พิมพ์ใบสรุป (Print/Save PDF)" action formatted cleanly for A4 page breaks with `@media print`
- [x] Add accessible keyboard navigation (Esc to dismiss, trap focus, visible focus indicator)
- [x] Verify zero visual clutter or truncation on both desktop and mobile screens
