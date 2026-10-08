# Specification: Parental Allowance Checkbox Selection, Dual-Rate Donation Persistence, and Shared Input Sanitization

**Status:** Ready for Review / Agent Ready  
**Reference ADR:** [docs/adr/0004-parent-allowance-person-selection-and-donation-split-persistence.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/adr/0004-parent-allowance-person-selection-and-donation-split-persistence.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/glossary.md)  

---

## 1. Problem Statement

1. **Incorrect Mental Model for Parental Allowance:** Under Section 47(1)(c) of the Thai Revenue Code, parental allowance is a fixed statutory deduction of 30,000 THB per eligible person (up to 4 individuals), not an arbitrary expense amount. A freeform numeric input causes users to enter incorrect amounts (e.g., 15,000 THB or 50,000 THB) that violate Revenue Department regulations.
2. **Loss of Dual-Rate Donation Fidelity in Database:** Although the tax calculation engine supports 2x education/hospital donations and 1x general donations, the database only persists a single combined `donation` column. Restoring from history collapses 2x donations into general donations.
3. **Duplicated Code Across Input Components:** Identical key-blocking and input-sanitization logic is duplicated between `IncomeSection` and `DeductionSection`.

---

## 2. Requirements & Scope

### 2.1 Parental Checkbox Selection (UI & Engine)
- In `DeductionSection`, replace the generic Baht amount input for `parentAllowance` with 4 distinct checkboxes:
  1. `บิดาของผู้มีเงินได้ (30,000 บาท)`
  2. `มารดาของผู้มีเงินได้ (30,000 บาท)`
  3. `บิดาของคู่สมรส (30,000 บาท)` *(แสดงคำแนะนำ: เฉพาะกรณีคู่สมรสไม่มีเงินได้)*
  4. `มารดาของคู่สมรส (30,000 บาท)` *(แสดงคำแนะนำ: เฉพาะกรณีคู่สมรสไม่มีเงินได้)*
- Automatically compute the total parent deduction as:
  $$\text{parentAllowance} = 30,000 \times N_{\text{selected}} \quad (0 \le N_{\text{selected}} \le 4)$$
- Display real-time deduction total (e.g., `60,000 บาท`) next to the section.

### 2.2 Dual-Rate Donation Persistence (Database & API)
- Expand `tax_records` table with non-destructive migrations:
  - `donation_education DECIMAL(12,2) DEFAULT 0`
  - `donation_general DECIMAL(12,2) DEFAULT 0`
- Maintain existing `donation` column as the post-cap total deduction for backward compatibility.
- Update `POST /api/tax/calculate` to store `donation_education` and `donation_general`.
- Update `GET /api/tax/history` and `fetchLatest()` in `TaxCalculatorPage` to restore both donation values into the form state.

### 2.3 Shared Input Sanitization Utility
- Create `src/utils/numberInput.js`:
  - `blockInvalidChars(e)`: blocks `['-', '+', 'e', 'E']`
  - `sanitizeNumericInput(val, max = 999999999)`: returns non-negative clamped number
- Refactor `IncomeSection.jsx` and `DeductionSection.jsx` to consume this shared module.

---

## 3. Acceptance Criteria

- [ ] ผู้ใช้สามารถเลือกติ๊กบิดา-มารดาตนเอง และบิดา-มารดาคู่สมรสได้อย่างอิสระ โดยระบบคำนวณเงินลดหย่อนคนละ 30,000 บาท สูงสุด 120,000 บาท
- [ ] เมื่อบันทึกและรีเฟรชหน้าจอ ข้อมูลเงินบริจาค 2 เท่า (การศึกษา/รพ.รัฐ) และ 1 เท่า (ทั่วไป) สามารถกู้คืนกลับมาแสดงผลในฟอร์มได้อย่างถูกต้อง
- [ ] ฟังก์ชันดักคีย์และตรวจสอบตัวเลขถูกสกัดเป็น Utility กลาง โดยไม่มีโค้ดซ้ำซ้อนในคอมโพเนนต์
- [ ] ทุกชุดทดสอบ `npm test`, `npm run lint`, และ `npm run build` ผ่าน 100%
