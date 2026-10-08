# Specification: Parental Allowance Checkbox Selection, Dual-Rate Donation Persistence, and Shared Input Sanitization

**Status:** ready-for-agent  
**Reference ADR:** [docs/adr/0004-parent-allowance-person-selection-and-donation-split-persistence.md](file:///c:/kmitl/PEE3\Cloude\project\Check_Pasi\docs\adr\0004-parent-allowance-person-selection-and-donation-split-persistence.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3\Cloude\project\Check_Pasi\docs\glossary.md)  

---

## Problem Statement

Users of the tax application encounter three major points of friction and inaccuracies:

1. **Confusion over Parental Allowance Calculation:** Under Section 47(1)(c) of the Thai Revenue Code, parental allowance is a statutory flat deduction of 30,000 THB per eligible parent (up to 4 people), not an arbitrary expense amount. Offering a generic text/numeric currency input confuses users, causing them to enter arbitrary figures (e.g. 15,000 THB or 50,000 THB) that violate Revenue Department regulations.
2. **Loss of Dual-Rate Donation Fidelity upon Reload:** While the tax engine computes 2x education/hospital donations and 1x general donations, the database only stores a single combined `donation` column. When a logged-in user retrieves their previous tax calculation, their 2x donations are flattened into general donations, losing their original input state.
3. **Code Duplication in Number Validation:** Multiple input forms duplicate identical keypress blocking (`-`, `+`, `e`, `E`) and bounding logic, leading to maintenance overhead and inconsistent error handling across sections.

---

## Solution

1. **Transform Parental Allowance into a 4-Item Checkbox Selector:**
   - Provide 4 clear checkboxes: Own Father (30,000 THB), Own Mother (30,000 THB), Spouse's Father (30,000 THB), and Spouse's Mother (30,000 THB).
   - Automatically compute the total allowance ($30,000 \times N_{\text{selected}}$, capped at 120,000 THB) with contextual statutory hints (age 60+, income $\le$ 30,000 THB/year, only one child can claim).
   - Persist individual parental selections so that returning users see their exact checkboxes restored.
2. **Dual-Rate Donation Persistence Across Full Vertical Slice:**
   - Expand database schema with `donation_education` and `donation_general` columns via non-destructive auto-migration.
   - Update API contracts and frontend state restoration so that 2x and 1x donation values survive save/reload cycles without loss of fidelity.
3. **Centralize Input Sanitization & Keypress Guards:**
   - Extract numeric parsing, negative number guarding, and keypress filtering into a single shared utility consumed by all income and deduction sections.

---

## User Stories

1. As a taxpayer supporting my elderly father, I want to check a box for "บิดาของผู้มีเงินได้ (30,000 บาท)", so that the legal 30,000 THB deduction is applied automatically without me having to type numbers.
2. As a taxpayer supporting both my parents, I want to check both my father and mother, so that the system immediately calculates a 60,000 THB deduction.
3. As a taxpayer supporting my spouse's parents (where my spouse has no income), I want to select my spouse's father and/or mother, so that I can legally claim up to 120,000 THB total parental allowance.
4. As a user claiming spouse parental allowance, I want to see a clear statutory reminder that spouse parental allowance requires the spouse to have zero income, so that I do not file an invalid tax claim.
5. As a taxpayer, I want to see an informational hint about the 3 legal requirements (age 60+, income not exceeding 30,000 THB/year, and non-duplicate claim via Form L.Y. 03), so that I understand Revenue Department compliance.
6. As a logged-in taxpayer, I want my selected parental checkboxes to be preserved when I save and return to the application later, so that I do not have to re-select my family members.
7. As a donor to state hospitals and public universities, I want my education/hospital donations (2x) stored separately from general donations (1x), so that when I reload my calculation history my 2x multiplier remains accurate.
8. As a user reviewing my previous calculations, I want both education donation and general donation breakdown fields accurately restored into the calculator form.
9. As a user typing in any income or deduction field, I want negative signs, plus signs, and exponential characters ('e', 'E') blocked on keydown, so that I cannot submit corrupted or negative numbers.
10. As a developer, I want all numeric parsing and validation centralized in a single shared utility module, so that bug fixes and bounds checks apply universally across all form sections.

---

## Implementation Decisions

### 1. Parental Allowance State & Database Representation
- **Frontend State:**
  ```javascript
  parentAllowance: {
    enabled: boolean,
    ownFather: boolean,
    ownMother: boolean,
    spouseFather: boolean,
    spouseMother: boolean,
    amount: number // computed as count * 30000
  }
  ```
- **Database Schema Expansion:**
  - `parent_own_father BOOLEAN DEFAULT false`
  - `parent_own_mother BOOLEAN DEFAULT false`
  - `parent_spouse_father BOOLEAN DEFAULT false`
  - `parent_spouse_mother BOOLEAN DEFAULT false`
  - Existing `parent_allowance DECIMAL(12,2)` is retained for fast summary querying and backward compatibility.

### 2. Dual-Rate Donation Database Columns
- Add columns to `tax_records` table:
  - `donation_education DECIMAL(12,2) DEFAULT 0`
  - `donation_general DECIMAL(12,2) DEFAULT 0`
- Existing `donation DECIMAL(12,2)` continues storing the final statutory deductible amount (after 2x multiplication and 10% net income ceiling).
- The save endpoint accepts both distinct fields, and the history endpoint returns both distinct fields.

### 3. Shared Input Utility Module
- Create a dedicated utility module exposing:
  - `blockInvalidChars(event)`: Prevents typing `-`, `+`, `e`, `E`.
  - `sanitizeNumericInput(value, max)`: Parses raw input strings into non-negative floats clamped to `max`.
- Refactor all existing input handlers to call this module directly.

---

## Testing Decisions

### Proposed Test Seams
- **Primary Seam (Single Highest Seam): Pure Domain Tax Engine Unit Tests**
  - *Rationale:* Testing domain calculations in memory without database overhead verifies all edge cases instantly.
  - *Module:* `test/taxEngine.test.js`
  - *Scenarios:*
    1. Parent Allowance permutation tests: 0, 1, 2, 3, and 4 parents yielding 0, 30,000, 60,000, 90,000, and 120,000 THB.
    2. Dual donation state preservation and calculation consistency.
    3. Negative and invalid input boundary handling through shared sanitizer.

---

## Out of Scope

- OCR parsing of tax deduction certificates (Form L.Y. 03).
- Verification of citizen ID numbers against the Department of Provincial Administration (DOPA) database.
- Electronic filing submission to the Revenue Department portal.

---

## Further Notes

- All changes maintain 100% backward compatibility with existing records.
- Migrations use non-destructive `ADD COLUMN IF NOT EXISTS` statements during server startup.
