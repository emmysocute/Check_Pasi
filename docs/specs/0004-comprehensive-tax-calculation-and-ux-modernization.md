# Specification: Comprehensive Tax Engine, Withholding Tax, and Modern UX Modernization

**Status:** Ready for Review / Agent Ready  
**Reference ADR:** [docs/adr/0003-comprehensive-tax-calculation-and-ux-modernization.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/adr/0003-comprehensive-tax-calculation-and-ux-modernization.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/glossary.md)  

---

## Problem Statement

Users of the Check Pasi (TaxMe) application currently face limitations that prevent them from obtaining an accurate, actionable personal income tax assessment under Thai Revenue Department rules (P.N.D. 90/91):

1. **No Net Tax Liability / Refund Visibility:** Taxpayers routinely have tax withheld at source under Withholding Tax certificates (50 Tawi). Because the application lacks a withholding tax field, users cannot see their true net outcome: whether they owe additional tax or are entitled to a tax refund.
2. **Missing Essential Deduction Categories:** The deduction section lacks key everyday deductions utilized by working taxpayers, including home loan mortgage interest (capped at 100,000 THB), elderly parent allowances (30,000 THB each), and charitable donations (with 2x education/hospital multipliers and 10% net income caps).
3. **Absence of Section 48(2) Flat Rate Comparison:** Freelancers earning over 120,000 THB annually are legally required by Section 48(2) of the Revenue Code to evaluate whether the 0.5% flat rate tax exceeds progressive bracket tax. The system currently evaluates only progressive rates.
4. **Opaque Progressive Tax Calculation:** Users receive only a single consolidated tax number without a progressive bracket breakdown, hiding their marginal tax rate and making it difficult to plan further tax-deductible contributions.
5. **Outdated Alert UI:** System feedback relies on blocking browser `window.alert()` popups, conflicting with modern fintech application standards.
6. **Tight Coupling of Tax Logic:** Tax math is embedded inside UI components rather than in an isolated, pure domain calculation engine, making automated unit testing and validation difficult.

---

## Solution

Upgrade the tax engine and user experience across four incremental, vertically integrated phases (Vertical Slices) where each feature is functional end-to-end (UI, API, and Database):

1. **Phase 1 (Withholding Tax, Refund/Payable Differentiation & Toast Notification):**
   - Add a sanitized Withholding Tax input to the income section.
   - Compute net liability ($\text{Tax} - \text{Withholding Tax}$).
   - Prominently display a vibrant green Tax Refund card when withholding exceeds tax, or an alert card when additional tax is owed.
   - Replace native browser alerts with a modern, non-blocking Toast Notification system.
   - Add non-destructive schema migrations and persistence for withholding tax.

2. **Phase 2 (Extended Deductions - Home Loan, Parents, Donations):**
   - Implement home loan mortgage interest with a 100,000 THB legal ceiling.
   - Implement elderly parent allowances with individual toggles (30,000 THB per eligible parent).
   - Implement donation deductions with dual-rate support (2x for approved education/sports/hospitals, 1x for general charities, capped at 10% of post-deduction income).
   - Expand database schema and API payloads accordingly.

3. **Phase 3 (Section 48(2) Flat Rate Tax & Collapsible Tax Bracket Breakdown):**
   - Automatically evaluate Section 48(2) for freelance income exceeding 120,000 THB and apply the higher tax method when flat tax exceeds 5,000 THB.
   - Introduce an interactive, collapsible Tax Bracket Breakdown in the result panel, showing taxable amount and tax per bracket, along with the user's marginal tax rate.

4. **Phase 4 (Domain Engine Extraction & Dashboard/History Polish):**
   - Decouple all tax computation logic into a standalone, pure domain module with comprehensive test seams.
   - Update calculation history tables and dashboard visual cards to reflect net status (Refund vs Payable) and breakdown metrics.

---

## User Stories

1. As a taxpayer who has taxes withheld each month (Form 50 Tawi), I want to enter my cumulative withholding tax, so that I can determine my actual net tax balance.
2. As a taxpayer eligible for a tax refund, I want the summary panel to display a prominent green Tax Refund badge with the refund amount, so that I immediately know what refund to claim from the Revenue Department.
3. As a taxpayer with remaining tax liability, I want to see an amber/red Additional Tax Payable notification, so that I know the exact amount I must pay before the filing deadline.
4. As a homeowner paying mortgage interest, I want to input my annual home loan interest and have the system automatically cap it at 100,000 THB, so that I receive my full legal deduction without over-claiming.
5. As a taxpayer caring for elderly parents (aged 60+), I want to claim a 30,000 THB allowance per eligible parent, so that my taxable income accurately reflects my family obligations.
6. As a donor to state hospitals and public schools, I want the system to calculate my donation at 2x the paid amount up to the statutory 10% ceiling, so that I obtain the maximum legal tax benefit.
7. As a donor to general religious or public charities, I want to claim 1x donation deductions within the 10% net income ceiling, so that my donation deductions are compliant.
8. As a freelancer earning over 120,000 THB in freelance income, I want the system to compare the progressive bracket method against the Section 48(2) 0.5% flat rate method, so that I comply with tax law.
9. As a freelancer whose Section 48(2) flat tax exceeds bracket tax, I want an explanatory informational badge detailing the calculation method used, so that I understand why my tax increased.
10. As a taxpayer analyzing my tax structure, I want to expand a collapsible tax bracket breakdown table, so that I can inspect the exact tax calculated in each income bracket (0%, 5%, 10%, 15%, 20%, 25%, 30%, 35%).
11. As a user seeking to optimize my financial planning, I want the system to display my Marginal Tax Bracket, so that I know the exact percentage saved for each additional baht of deductions purchased.
12. As a user saving my calculation, I want to see an animated toast notification confirming success instead of a modal browser popup, so that my workflow is smooth and uninterrupted.
13. As a user encountering a network or server error while saving, I want to receive an error toast with actionable information, so that I know how to retry.
14. As a logged-in user viewing my calculation history, I want each record to display whether the calculation resulted in a tax refund or additional tax payable, so that I can track past filing statuses.
15. As a user reviewing my home dashboard, I want the stats summary and pie chart to accurately distinguish tax liabilities from take-home income and deductions, so that financial representations are mathematically consistent.
16. As a user filling out income and deduction forms, I want input fields to gracefully format numeric entries and block invalid negative values, so that my entries are error-free.
17. As a developer, I want all tax computation logic encapsulated in a standalone pure function, so that domain rules can be unit tested without mounting React components.

---

## Implementation Decisions

- **Architecture (Vertical Slices):** Rather than implementing all UI changes followed by all backend changes, each phase is executed as an end-to-end vertical slice (form inputs $\rightarrow$ state $\rightarrow$ pure tax engine $\rightarrow$ API endpoint $\rightarrow$ PostgreSQL schema migration).
- **Pure Domain Engine:** Extract the tax calculation logic into a dedicated pure function module outside of React hooks. The engine receives a typed/sanitized input configuration and returns an immutable result object including:
  - Annual income breakdown
  - Standard expense deduction
  - Itemized allowance deductions and total deductions
  - Net taxable income
  - Progressive tax amount per bracket and marginal bracket rate
  - Flat rate Section 48(2) tax evaluation and chosen tax method
  - Withholding tax, net balance, and refund/payable status
- **Schema & Database Migrations:** Expand the `tax_records` table using non-destructive startup migrations (`ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS ...`):
  - `withholding_tax DECIMAL(12,2) DEFAULT 0`
  - `home_loan_interest DECIMAL(12,2) DEFAULT 0`
  - `parent_allowance DECIMAL(12,2) DEFAULT 0`
  - `donation DECIMAL(12,2) DEFAULT 0`
  - `tax_method VARCHAR(20) DEFAULT 'bracket'`
- **Toast Notification Subsystem:** Build a lightweight, accessible Toast Notification component controlled by a simple state or context, supporting auto-dismiss (3-4 seconds), smooth slide-in/fade-out animations, and explicit dismiss buttons.
- **Collapsible Bracket Presentation:** The bracket table inside the result panel defaults to collapsed to maintain clean hierarchy on mobile screens, expanding smoothly upon user interaction.
- **Sanitization & Defensive Bounds:** All numerical inputs, both on client and server, enforce lower bounds ($\ge 0$) and reasonable upper bounds ($< 1,000,000,000$ THB) with keypress blocking of negative and exponential characters.

---

## Testing Decisions

### Proposed Test Seams
- **Primary Seam (Single Highest Seam):** **Domain Tax Engine Pure Unit Tests**
  - *Rationale:* Tax math constitutes the core business logic of the entire application. Testing pure calculation functions allows verification of edge cases (threshold boundaries, ceilings, Section 48(2) comparisons, refund thresholds) in milliseconds without database or browser overhead.
- **Secondary Seam:** **API Endpoint Integration Seam**
  - Verify that `POST /api/tax/calculate` properly validates inputs, enforces statutory caps, and persists new fields into PostgreSQL.
- **Tertiary Seam:** **UI Component Render Seam**
  - Verify that ResultPanel renders green refund styling when withholding $>$ tax, and amber payable styling when tax $>$ withholding.

### Test Scenarios
1. **Net Tax Refund Scenario:**
   - Income: 50,000 THB/month. Deductions: Personal (60,000), Social Security (9,000).
   - Calculated Tax: 17,600 THB. Withholding Tax entered: 25,000 THB.
   - Expected Output: Status = `refund`, Refund Amount = 7,400 THB.
2. **Additional Tax Payable Scenario:**
   - Calculated Tax: 17,600 THB. Withholding Tax entered: 10,000 THB.
   - Expected Output: Status = `payable`, Payable Amount = 7,600 THB.
3. **Home Loan Interest Ceiling Scenario:**
   - User inputs 150,000 THB home loan interest.
   - Expected Deduction applied: 100,000 THB.
4. **Section 48(2) Flat Rate Scenario:**
   - Salary: 0. Freelance Income: 2,000,000 THB. Deductions: 1,900,000 THB.
   - Method 1 (Bracket) Tax: 0 THB.
   - Method 2 (Flat 0.5%): 10,000 THB ($> 5,000$ THB).
   - Expected Result: Tax = 10,000 THB, Method = `flat_rate_section_48_2`.

---

## Out of Scope

- Direct API submission to the Thai Revenue Department (e-Filing API requires government-issued corporate credentials).
- Corporate income tax (CIT) and Value Added Tax (VAT 7%) returns.
- Inheritance tax and land/building tax assessments.

---

## Further Notes

- All changes adhere to ADR 0001, ADR 0002, and ADR 0003.
- The plan utilizes Vertical Slices to deliver immediately usable, fully testable increments at each step.
