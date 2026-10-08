# Specification: ระบบคำนวณภาษีฉบับสมบูรณ์ (ภาษีหัก ณ ที่จ่าย, สิทธิลดหย่อนเพิ่มเติม, ภาษีวิธีที่ 2 และ Modern UX)

**Status:** Ready for Review / Agent Ready  
**Reference ADR:** [docs/adr/0003-comprehensive-tax-calculation-and-ux-modernization.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/adr/0003-comprehensive-tax-calculation-and-ux-modernization.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/glossary.md)  

---

## Problem Statement

ระบบ Check Pasi (TaxMe) ปัจจุบันสามารถคำนวณภาษีขั้นบันไดพื้นฐานได้ แต่ยังขาดองค์ประกอบสำคัญในการใช้งานจริงของผู้เสียภาษีชาวไทย:
1. **ไม่ทราบยอดชำระเพิ่มหรือยอดเงินคืนจริง:** ผู้ใช้ไม่สามารถระบุภาษีหัก ณ ที่จ่าย (Withholding Tax) ได้ ทำให้ไม่รู้ว่าสุดท้ายแล้วตนเองจะได้รับเงินคืนภาษี (Tax Refund) หรือต้องจ่ายเงินเพิ่มให้สรรพากร
2. **หมวดลดหย่อนยังไม่ครอบคลุม:** ขาดรายการลดหย่อนยอดนิยม เช่น ดอกเบี้ยเงินกู้บ้าน (สูงสุด 100,000 บ.), อุปการะบิดามารดา (คนละ 30,000 บ.) และเงินบริจาค
3. **ขาดการเปรียบเทียบภาษีวิธีที่ 2:** สำหรับฟรีแลนซ์ที่มีรายได้เกิน 120,000 บ./ปี ซึ่งตามกฎหมายสรรพากร ม.48(2) ต้องคิดเปรียบเทียบกับวิธีเหมา 0.5%
4. **ขาดรายละเอียดขั้นบันไดภาษี:** ผู้ใช้ไม่เห็นว่าเงินได้สุทธิตกอยู่ในขั้นใดบ้าง และอัตราภาษีสูงสุด (Marginal Rate) คือเท่าใด
5. **ประสบการณ์ผู้ใช้ (UX):** ยังใช้ `window.alert()` แบบ Browser Popup สีขาวเดิม

---

## Solution

ดำเนินการพัฒนาและยกระดับระบบออกเป็น 4 เฟสการทำงานที่ชัดเจน:

1. **เฟสที่ 1: ระบบภาษีหัก ณ ที่จ่าย และคำนวณเงินคืนภาษี (Withholding Tax & Tax Refund Flow)**
   - เพิ่มฟิลด์ `withholdingTax` ในส่วนกรอกข้อมูลรายได้
   - คำนวณยอดสุทธิ: หักลบระหว่างภาษีทั้งปีกับภาษีที่ถูกหักไปแล้ว
   - แสดงผลลัพธ์แยกสีชัดเจน: **สีเขียว** เมื่อได้เงินคืนภาษี, **สีส้ม/แดง** เมื่อต้องชำระเพิ่ม
   - ติดตั้งระบบ **Toast Notification UI** แทนที่ `window.alert()`

2. **เฟสที่ 2: ขยายรายการลดหย่อนมาตรฐานสรรพากร (Extended Deductions)**
   - ดอกเบี้ยเงินกู้ยืมเพื่อซื้อที่อยู่อาศัย (Cap 100,000 บ.)
   - ค่าลดหย่อนอุปการะบิดามารดา (คนละ 30,000 บ.)
   - เงินบริจาค (การศึกษา/กีฬา/รพ. 2 เท่า, ทั่วไป 1 เท่า Cap ไม่เกิน 10% ของเงินได้หลังหักลดหย่อน)

3. **เฟสที่ 3: ระบบคำนวณภาษีวิธีที่ 2 (Flat Rate 0.5% ม.48(2)) และ Tax Bracket Breakdown**
   - คำนวณเปรียบเทียบวิธีที่ 1 (ขั้นบันได) และวิธีที่ 2 (เหมา 0.5%) อัตโนมัติ
   - เพิ่ม Collapsible Accordion แจกแจงภาษีแต่ละขั้นบันไดใน ResultPanel

4. **เฟสที่ 4: Data Persistence & Architecture Polish**
   - เพิ่มคอลัมน์และ Auto-migration ใน PostgreSQL: `withholding_tax`, `home_loan_interest`, `parent_allowance`, `donation`
   - ปรับปรุงหน้า History และ Dashboard ให้รองรับข้อมูลใหม่ครบถ้วน

---

## User Stories

1. As a taxpayer who had tax withheld at source (50 ทวิ), I want to enter my withholding tax amount, so that I can see whether I will get a tax refund or need to pay additional tax.
2. As a taxpayer eligible for a tax refund, I want the result panel to prominently display a green refund banner with the refund amount, so that I feel delighted and clearly informed.
3. As a homeowner paying mortgage interest, I want to claim home loan interest up to 100,000 THB, so that I can reduce my taxable income according to the law.
4. As a taxpayer supporting elderly parents, I want to claim parent allowance (30,000 THB each), so that my taxable income is accurately lowered.
5. As a freelancer with over 120,000 THB freelance income, I want the system to calculate both progressive brackets and the 0.5% flat rate method, so that I comply with Section 48(2).
6. As a user reviewing tax results, I want to expand a tax bracket breakdown table, so that I see exactly how much tax is charged at each bracket and know my marginal tax rate.
7. As a user saving my calculation, I want to see a sleek toast notification instead of a native blocking browser alert, so that my experience feels modern and smooth.

---

## Testing Decisions

### Test Seams
1. **Unit / Calculation Seams:**
   - ทดสอบ Withholding Tax: กรณีหัก ณ ที่จ่าย > ภาษี $\rightarrow$ ได้รับเงินคืน (Refund)
   - ทดสอบ Withholding Tax: กรณีหัก ณ ที่จ่าย < ภาษี $\rightarrow$ จ่ายเพิ่ม (Payable)
   - ทดสอบ Cap ดอกเบี้ยบ้าน: กรอก 150,000 $\rightarrow$ หักได้สูงสุด 100,000 บ.
   - ทดสอบวิธีที่ 2 (เหมา 0.5%): ตรวจสอบเมื่อ `freelanceIncome > 120,000` และเปรียบเทียบกับวิธีที่ 1
2. **Component Integration Seams:**
   - ตรวจสอบการเรนเดอร์ Toast notification เมื่อกดบันทึก
   - ตรวจสอบการคลี่/พับ Accordion ของ Tax Bracket Breakdown

---

## Out of Scope

- การยื่นแบบแสดงรายการออนไลน์ตรงไปยัง API ของกรมสรรพากร (ต้องใช้ API Key ของภาครัฐ)
- การคำนวณภาษีมรดกและภาษีที่ดิน/สิ่งปลูกสร้าง
