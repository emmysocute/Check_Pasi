# Spec: Fintech UX Elevation, Freelance Tracker Overhaul, and ภ.ง.ด. Pre-Filing Sheet

Status: ready-for-agent

## Problem Statement

Users of Check Pasi face significant usability and cognitive hurdles when moving beyond basic tax calculation:
1. Freelancers logging 12 monthly invoices are overwhelmed by an uninterrupted wall of 48 input fields in `MonthlyTrackerPage`, leading to high cognitive fatigue and data entry errors.
2. After completing calculations, taxpayers are left at a dead-end with no actionable advice on how to legally optimize deductions (such as SSF/RMF) to save money before the tax year ends.
3. When taxpayers attempt to file their actual tax return on the Thai Revenue Department e-Filing portal (`rd.go.th`), they struggle to map Check Pasi's figures to the complex statutory form fields of ภ.ง.ด. 90/91.
4. Freelancers have no mechanism to export their 12-month accounting logs into spreadsheets (CSV/Excel) for their accountants or tax record archives.
5. In the profile section, sensitive tax identification numbers are displayed in raw unmasked text, violating modern financial privacy expectations.

## Solution

Transform Check Pasi from a passive calculator into an intelligent, end-to-end Personal Income Tax and Filing Companion:
1. **Quarterly Tabbed Freelance Tracker:** Chunk the 12-month tracker into manageable quarterly views (Q1–Q4) with sticky annual summaries and withholding tax totals.
2. **Spreadsheet Data Portability:** Provide one-click CSV/Excel export for the 12-month income and withholding tax records.
3. **Tax Saving Advisor & What-If Simulator:** Equip the calculation results with an interactive simulation tool showing taxpayers exactly how much money returns to their pockets when investing in retirement funds or insurance.
4. **ภ.ง.ด. 90/91 Pre-Filing Cheat Sheet:** Provide an accessible, field-by-field reference guide mapping Check Pasi values directly to Revenue Department e-Filing boxes, printable in clean A4 format.
5. **Privacy Protection & Input Masking:** Mask the 13-digit National Tax ID with a reveal toggle and provide draft recovery.

## User Stories

1. As a freelancer, I want to view my 12-month income logs grouped by quarters (Q1 to Q4), so that I do not suffer cognitive overload from viewing 48 input boxes simultaneously.
2. As a freelancer, I want to see a persistent sticky summary bar at the bottom of the tracker showing annual gross income and accumulated withholding tax, so that I always know my year-to-date standing regardless of scroll position.
3. As a freelancer, I want to export my 12-month income records into a standard CSV / Excel file, so that I can send it directly to my accountant or save it for tax filing records.
4. As a taxpayer, I want to simulate additional deductions (such as SSF, RMF, or life insurance) with a live slider, so that I can immediately see how much tax I can save before committing money.
5. As a taxpayer in the 15% marginal bracket, I want the system to offer tailored Thai tax-saving advice, so that I can take advantage of statutory tax privileges.
6. As a taxpayer preparing to file on `rd.go.th`, I want to open a "ภ.ง.ด. 90/91 Pre-Filing Cheat Sheet", so that I can copy each figure directly into the matching box on the government portal.
7. As a taxpayer, I want to print or save the pre-filing summary sheet as a clean A4 document, so that I have physical or PDF documentation of my calculation.
8. As a user, I want my 13-digit National Tax ID on the profile page to be masked by default with an optional visibility toggle, so that my personal sensitive data is protected from shoulder surfing.
9. As a guest user without an account, I want my calculation state to be preserved in local storage, so that I do not lose my entered figures if I refresh or accidentally close the tab.
10. As a keyboard user, I want full keyboard accessibility and visible focus rings across all tracker tabs and modal cheat sheets, so that I can navigate efficiently without a mouse.

## Implementation Decisions

### Module 1: Quarterly Grouping & Tracker UI Refactor
- Refactor the 12-month table in the monthly tracker into a segmented tab interface: `[Q1 (ม.ค.-มี.ค.)]`, `[Q2 (เม.ย.-มิ.ย.)]`, `[Q3 (ก.ค.-ก.ย.)]`, `[Q4 (ต.ค.-ธ.ค.)]`, plus an `[ทั้งปี (All 12 Months)]` toggle.
- Maintain existing database schema (`monthly_records` table) and backend API contracts without breaking changes.
- Implement a floating sticky summary banner displaying total gross income, withholding tax (3%), and net estimated tax impact.

### Module 2: CSV / Spreadsheet Export Engine
- Create a pure client-side CSV generator utility that formats month name, client/employer name, income amount, withholding tax rate, tax deducted, and net cash received.
- Encode CSV with UTF-8 BOM (`\uFEFF`) so that Thai characters render flawlessly in Microsoft Excel.

### Module 3: What-If Deduction Simulator & Tax Advisor
- Build a simulator component attached to `ResultPanel` that tests incremental investments (e.g. ฿10,000 to ฿100,000 in SSF/RMF) and calculates `deltaTax = currentTax - simulatedTax`.
- Display dynamic microcopy: *"ลงทุน SSF/RMF เพิ่มอีก ฿X,XXX จะได้รับเงินภาษีคืนเพิ่ม ฿Y,YYY (ประหยัดได้ Z%)"*.

### Module 4: ภ.ง.ด. 90/91 Pre-Filing Modal & Printable Sheet
- Build a dedicated modal dialog and printable CSS stylesheet (`@media print`) that maps:
  - ภ.ง.ด. หมวดเงินได้ 40(1) (เงินเดือน)
  - ภ.ง.ด. หมวดเงินได้ 40(2) (รับจ้าง/ฟรีแลนซ์)
  - หักค่าใช้จ่ายเหมา 50%
  - หักลดหย่อน 4 หมวดสรรพากร (ตนเอง, ประกัน/ออม, ที่อยู่อาศัย, บริจาค)
  - ภาษีหัก ณ ที่จ่ายสะสม
- Format clean typography with official government terminology and clear field numbering.

### Module 5: National ID Masking & Privacy Guard
- Add mask formatting function: `X-XXXX-XXXXX-XX-X` showing only the first digit and last 4 digits by default.
- Include an eye icon button (`aria-label="แสดง/ซ่อนเลขบัตรประชาชน"`) to toggle raw numbers.

## Testing Decisions

- **Testing Seam 1 (Domain Logic & Math):** Test all aggregation, tax advisor delta calculations, and CSV formatting via pure Node test suites (`node --test`), matching prior art in `test/taxEngine.test.js` and `test/monthlyTracker.test.js`.
- **Testing Seam 2 (Component Behavior & Accessibility):** Verify tab navigation, ARIA attributes, masking toggles, and reactive calculations through isolated test helpers and linting (`oxlint`).
- **Good Code Standards:** All functions must be pure, non-mutating, strictly typed with defensive bounds, and free from external side-effects.

## Out of Scope

- Direct API integration with the Revenue Department's internal e-Filing servers (not officially supported by Thai government APIs).
- Automated OCR scanning of 50 ทวิ withholding tax certificates (future AI roadmap).
- Corporate income tax (ภ.ง.ด. 50/51) calculations; this system strictly serves Personal Income Tax.

## Further Notes

- Adheres to ADR 0006 (Monthly Tracker) and ADR 0007 (Statutory Tax Taxonomy & Fintech UX Elevation).
- Backward-compatible with all existing database records and API endpoints.
