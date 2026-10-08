# Specification: 12-Month Part-Time & Monthly Income Tracker with Customizable Columns

**Status:** ready-for-agent  
**Reference ADR:** [docs/adr/0006-twelve-month-part-time-income-tracker.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/adr/0006-twelve-month-part-time-income-tracker.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/glossary.md)  

---

## Problem Statement

Users of the tax application who earn part-time wages, freelance fees, or variable gig income encounter three major points of friction:

1. **Fluctuating Monthly Income for Part-Time & Freelancers:** Taxpayers working hourly, part-time, or freelance jobs receive differing paychecks each month. The existing calculator assumes a static monthly salary multiplied by 12, forcing part-time workers to compute their annual income on external spreadsheets before using the app.
2. **Scattered Withholding Tax (WHT):** Freelance and part-time workers frequently have 3% withholding tax deducted by various employers and clients. Without a single dashboard to accumulate their monthly tax withheld throughout the year, they frequently miss out on substantial tax refunds (Tax Refund) from the Revenue Department.
3. **Form Fatigue on Mobile Devices:** Forcing mobile users to view 4 inputs across all 12 months produces 48 input boxes, causing visual clutter, high cognitive load, and abandoned forms on small screens.
4. **Opacity Regarding Donation 10% Statutory Ceiling:** Under Section 47(7) of the Revenue Code, donation deductions are legally capped at 10% of net taxable income after expenses and other allowances. Users currently have no visibility into what their statutory cap is before typing, causing confusion when high donation amounts do not proportionally reduce tax.

---

## Solution

1. **Dedicated Monthly Tracker Page (`/monthly-tracker`):**
   - Provide an independent page accessible directly from the sidebar navigation: **"📅 บันทึกรายได้ 12 เดือน"**.
   - Include a tax year selector (e.g. 2569 / 2026, 2568 / 2025) with automatic state restoration.
2. **Customizable Monthly Columns (Column Selector Pills):**
   - Provide quick toggle pills at the top of the tracker allowing users to enable only the columns they need:
     - `[✓] รายได้ของเดือน (Income)` *(Always enabled)*
     - `[ ] ภาษีหัก ณ ที่จ่าย (Withholding Tax)` *(Toggleable)*
     - `[ ] เงินสมทบประกันสังคม (Social Security)` *(Toggleable)*
     - `[ ] โน้ต/แหล่งที่มา (Note/Workplace)` *(Toggleable)*
   - Responsive design adapts from multi-column grid on desktop to compact card rows on mobile.
3. **Smart Shortcuts & Input Helpers:**
   - **Direct Input is Primary:** Users can freely type whatever withholding tax or income they actually received (e.g. when working 2 jobs where only one job deducted WHT).
   - **Optional 3% Shortcut Button (`[⚡ 3%]`):** One-click helper that calculates `Income * 0.03` for users with standard freelance contracts without locking the input.
   - **Copy to Next Month (`[📋 คัดลอก]`):** Fast data entry for recurring payments.
4. **Live Annual Summary & Tax Refund Callout:**
   - Sticky summary bar calculating total annual income, total withholding tax, and total social security.
   - **Refund Opportunity Callout:** Highlights estimated tax refund potential (e.g. *"🎉 คุณมีโอกาสได้รับเงินคืนภาษีสะสมสูงสุด: +X,XXX บาท"*).
   - **One-Click Bridge to Tax Calculator:** Button **"🚀 ส่งยอดไปคำนวณภาษีประจำปี"** transfers aggregate sums into `/calculator` via route state.
5. **Database Persistence & User Preference Storage:**
   - Store 12 rows per user per tax year in PostgreSQL with non-destructive auto-migrations.
   - Persist column toggle preferences so users see their preferred view whenever they return.
6. **Donation 10% Ceiling Indicator & Soft Warning:**
   - Expose `maxDonationCap` in calculation results (`remainingBeforeDonation * 0.10`).
   - Display a real-time info badge showing the active annual 10% donation ceiling: *"ℹ️ สิทธิลดหย่อนเงินบริจาคสูงสุดของคุณในปีนี้: ไม่เกิน XX,XXX บาท (10% ของเงินได้หลังหักค่าใช้จ่ายและค่าลดหย่อนอื่น)"*.
   - When the user's entered donation amount exceeds `maxDonationCap`, display a non-blocking soft warning badge: *"⚠️ ยอดบริจาคที่คุณกรอกเกินสิทธิสูงสุด (ระบบจะนำไปลดหย่อนให้ตามเพดานจริงที่ XX,XXX บาท)"*.
   - Do NOT restrict or lock numeric input typing; allow users to type arbitrary figures from their receipts freely.

---

## User Stories

1. As a part-time barista earning different wages every month, I want to record my exact income for each of the 12 months, so that I don't have to manually sum them on an external calculator.
2. As a freelancer having 3% tax deducted by clients, I want to toggle on the "ภาษีหัก ณ ที่จ่าย" column, so that I can record the tax withheld on each monthly receipt.
3. As a freelance tutor who only earns income without social security deductions, I want to leave the "ประกันสังคม" column disabled, so that my 12-month table remains clutter-free and fast to fill on my mobile phone.
4. As a user working two jobs in April (one deducted 3% and one not deducted), I want to type my actual withholding tax amount freely, so that I am not forced into an automated formula that conflicts with my receipts.
5. As a user whose entire monthly income is subject to 3% tax, I want a quick shortcut button `[⚡ 3%]` next to the field, so that I can compute 3% in a single tap without mental math.
6. As a freelance graphic designer with a recurring 3-month retainer, I want a `[📋 คัดลอก]` button to copy this month's values into the next month, so that I do not have to retype identical figures.
7. As a mobile phone user, I want the 12-month tracker to display in a clean, compact vertical card view, so that I can navigate without cumbersome horizontal scrolling.
8. As a taxpayer who has recorded 12 months of income, I want to see a live sticky annual summary bar, so that I immediately know my total annual income and total withholding tax.
9. As a user who has accumulated withholding tax, I want to see an estimated tax refund callout, so that I feel motivated to file my taxes and claim my money back.
10. As a taxpayer ready to file, I want a one-click button **"🚀 ส่งยอดไปคำนวณภาษีประจำปี"**, so that my annual totals are automatically prefilled into `/calculator` without manual re-entry.
11. As a registered user, I want my 12-month tracker records and column toggle preferences saved in the database, so that I can return and update my figures at the end of every month.
12. As a user tracking past tax years, I want a tax year selector (e.g. 2568, 2569), so that I can view and record income for different years independently.
13. As a donor to charities and schools, I want to see my actual 10% legal deduction ceiling in real-time beneath the donation field, so that I understand my statutory limit before filing.
14. As a donor whose donation receipts exceed the 10% statutory limit, I want to see a clear, friendly soft warning banner explaining that deductions are capped at the legal ceiling, so that I am not confused while still being allowed to type my actual receipt numbers.

---

## Implementation Decisions

### 1. Route & Navigation Integration
- Add a new dedicated route `/monthly-tracker` in the application router.
- Add a navigation item in the Sidebar: `📅 บันทึกรายได้ 12 เดือน` with active state styling.
- Provide a responsive layout that matches the existing modern theme.

### 2. State & Column Customization Architecture
- Column visibility state managed locally and persisted in `monthly_tracker_settings`:
  - `showWithholding`: boolean (default `true`)
  - `showSocialSecurity`: boolean (default `false`)
  - `showNote`: boolean (default `false`)
- Monthly records managed as an array of 12 objects:
  ```json
  [
    { "month": 1, "income": 0, "withholdingTax": 0, "socialSecurity": 0, "note": "" },
    ...
    { "month": 12, "income": 0, "withholdingTax": 0, "socialSecurity": 0, "note": "" }
  ]
  ```

### 3. Database Schema Expansion
- Prototype-derived schema for persistence:
  ```sql
  CREATE TABLE IF NOT EXISTS monthly_income_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tax_year INTEGER NOT NULL,
      month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
      income DECIMAL(12,2) DEFAULT 0,
      withholding_tax DECIMAL(12,2) DEFAULT 0,
      social_security DECIMAL(12,2) DEFAULT 0,
      note TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, tax_year, month)
  );

  CREATE TABLE IF NOT EXISTS monthly_tracker_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      show_withholding BOOLEAN DEFAULT true,
      show_social_security BOOLEAN DEFAULT false,
      show_note BOOLEAN DEFAULT false,
      updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

### 4. API Endpoints
- `GET /api/monthly-tracker?year=YYYY`: Returns `{ records: Array<MonthlyRecord>, settings: Settings }`.
- `POST /api/monthly-tracker`: Body `{ year: number, records: Array<MonthlyRecord>, settings: Settings }`, executes bulk upsert using `ON CONFLICT (user_id, tax_year, month) DO UPDATE`.

### 5. Bridge to Calculator
- When clicking "ส่งยอดไปคำนวณภาษีประจำปี", navigate to `/calculator` with navigation state `{ prefill: { incomeOther: totalIncome, withholdingTax: totalWithholding, socialSecurity: totalSocialSecurity } }`.
- The calculator page checks `location.state?.prefill` and seamlessly initializes or supplements form fields.

### 6. Tax Engine Donation Ceiling Indicator
- Pure calculation in the tax engine computes:
  - `remainingBeforeDonation = Math.max(0, sumIncome - expenseDeduction - preDonationDeduction)`
  - `maxDonationCap = remainingBeforeDonation * 0.10`
  - `rawDonationClaim = (donationEducation * 2) + donationGeneral`
  - `actualDonationDeduction = Math.min(rawDonationClaim, maxDonationCap)`
- Expose `maxDonationCap` and `rawDonationClaim` in the result object.
- The UI renders the real-time ceiling badge and, if `rawDonationClaim > maxDonationCap`, displays a soft warning notice.

---

## Testing Decisions

### What Makes a Good Test
- Tests must verify external behavioral contracts, domain rules, and edge conditions, rather than private implementation details.
- Calculations must be verified across standard inputs, zero inputs, and extreme boundary values.

### Proposed Test Seams
1. **Primary Seam (Domain Engine Unit Tests):**
   - *Seam:* Pure functions in `src/utils/taxEngine.js` tested via Node.js built-in runner (`node --test`).
   - *Scope:*
     - Donation 10% ceiling calculation (`maxDonationCap = remainingBeforeDonation * 0.10`).
     - Clamping of raw donation claim when exceeding 10% ceiling.
     - Accurate exposure of `maxDonationCap` and `rawDonationClaim`.
     - 12-month aggregation math and estimated tax refund formulas.
   - *Prior Art:* `test/taxEngine.test.js` (currently 15 passing tests).

2. **Secondary Seam (Backend API Integration Tests):**
   - *Seam:* HTTP request/response handlers for `/api/monthly-tracker`.
   - *Scope:*
     - Bulk upsert of 12 monthly records for a given tax year.
     - Querying records by tax year with correct defaults for empty months.
     - Persistence and retrieval of user column toggle settings.
   - *Prior Art:* `backend/server.js` test routes.

3. **Tertiary Seam (UI & End-to-End User Flow):**
   - *Seam:* User interaction layer on `/monthly-tracker` and `/calculator`.
   - *Scope:*
     - Column selector pills toggling visibility of table columns.
     - `[⚡ 3%]` helper calculating 3% withholding tax.
     - Navigation bridge prefilling `/calculator` with aggregated monthly values.
     - Live display of donation ceiling badge and soft warning banner when exceeding the cap.

---

## Out of Scope

- Direct bank transaction OCR or bank statement parsing.
- Automated tax filing submission to Revenue Department APIs.
- Multi-currency conversion (all values in THB).

---

## Further Notes

- Design and color tokens will reuse existing CSS classes (`.glass-card`, `.btn-primary`, `.badge`, `.summary-card`) for visual consistency.
- Mobile responsiveness will support standard breakpoints ($\le 479$px, tablet, and desktop) with smooth transition between card view and table view.
- Contrast ratios will adhere to WCAG AA standards.
