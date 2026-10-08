# Specification: 12-Month Part-Time & Monthly Income Tracker with Customizable Columns

**Status:** ready-for-agent  
**Reference ADR:** [docs/adr/0006-twelve-month-part-time-income-tracker.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/adr/0006-twelve-month-part-time-income-tracker.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/glossary.md)  

---

## 1. Problem Statement

1. **Fluctuating Monthly Income for Part-Time & Freelancers:** Taxpayers working hourly, part-time, gig, or freelance jobs receive varying payments each month. The existing calculator model assumes a static monthly salary multiplied by 12, forcing part-time users to manually calculate their annual sum on external spreadsheets.
2. **Scattered Withholding Tax (WHT):** Part-time and gig workers frequently have 3% withholding tax deducted across various clients. Because they have no single dashboard to accumulate these receipts, they frequently miss out on tax refunds (Tax Refund) from the Revenue Department.
3. **Form Fatigue on Mobile Devices:** Forcing users to fill 4 input fields across 12 months produces 48 inputs, causing severe visual clutter and abandoned forms on mobile screens.

---

## 2. Proposed Solution

1. **Dedicated Monthly Tracker Page (`/monthly-tracker`):**
   - Independent route accessible from the sidebar menu: **"📅 บันทึกรายได้ 12 เดือน"**.
   - Supports selecting tax years (e.g. 2569 / 2026, 2568 / 2025).
2. **Customizable Monthly Columns (Column Selector Pills):**
   - Quick toggle pills at the top of the form allowing users to enable only the columns they need:
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
5. **Database Persistence:**
   - PostgreSQL table `monthly_income_records` storing 12 rows per user per tax year with non-destructive auto-migrations.
   - Full API support: `GET /api/monthly-tracker?year=YYYY` and `POST /api/monthly-tracker`.

---

## 3. User Stories

1. As a part-time barista earning different wages every month, I want to record my exact income for each of the 12 months, so that I don't have to manually sum them on a calculator.
2. As a freelancer having 3% tax deducted by clients, I want to enable the "ภาษีหัก ณ ที่จ่าย" column and record the tax withheld each month.
3. As a freelance tutor who only earns income without social security deductions, I want to leave the "ประกันสังคม" column disabled, so that my 12-month table remains clutter-free and fast to fill on my mobile phone.
4. As a user working two jobs in April (one deducted 3% and one not deducted), I want to type my actual withholding tax amount freely without being forced into an automatic formula.
5. As a user whose entire monthly income is subject to 3% tax, I want a quick shortcut button to calculate 3% in one tap.
6. As a taxpayer who has recorded 12 months of income, I want to see my annual total and estimated tax refund, and click a button to send these totals directly into the tax calculator.
7. As a registered user, I want my 12-month records saved in the database, so that I can return and update my figures at the end of every month throughout the year.

---

## 4. Technical Specifications & Database Schema

### Table: `monthly_income_records`
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
```

### Table: `monthly_tracker_settings`
```sql
CREATE TABLE IF NOT EXISTS monthly_tracker_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    show_withholding BOOLEAN DEFAULT true,
    show_social_security BOOLEAN DEFAULT false,
    show_note BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
- `GET /api/monthly-tracker?year=YYYY`
  - Returns `{ records: Array<MonthlyRecord>, settings: Settings }`
- `POST /api/monthly-tracker`
  - Body: `{ year: number, records: Array<MonthlyRecord>, settings: Settings }`
  - Bulk upserts 12 rows using `ON CONFLICT (user_id, tax_year, month) DO UPDATE`.

---

## 5. Out of Scope
- Direct bank transaction OCR or bank statement parsing.
- Automated tax filing submission to Revenue Department APIs.
