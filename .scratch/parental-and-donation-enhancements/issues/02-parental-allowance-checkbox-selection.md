# 02: Parental Allowance Checkbox Selection Full Vertical Slice

**What to build:** 
ยกระดับระบบค่าลดหย่อนอุปการะเลี้ยงดูบิดามารดาในหน้าคำนวณภาษี จากช่องกรอกตัวเลขเงินบาทเดิม เป็นตัวเลือก Checkbox รายบุคคล 4 ท่าน (บิดาตนเอง, มารดาตนเอง, บิดาคู่สมรส, มารดาคู่สมรส คนละ 30,000 บาท สูงสุด 120,000 บาท) พร้อม Hint แนะนำเกณฑ์สรรพากร (อายุ 60+, รายได้ไม่เกิน 30,000 บ./ปี, หนังสือ ล.ย.03), คำนวณยอดเงินรวมให้อัตโนมัติ, ขยายคอลัมน์ boolean 4 ตัวใน PostgreSQL ผ่าน Auto-migration, บันทึกผ่าน API และกู้คืนสถานะ Checkbox กลับมาแสดงผลในฟอร์มได้อย่างแม่นยำ 100% เมื่อเข้าสู่ระบบ

**Blocked by:** 01: Shared Input Sanitization and Keypress Guards (Prefactoring)

**Status:** closed

- [x] ปรับปรุง DeductionSection ให้แสดง Checkbox 4 รายการสำหรับบิดามารดา แทนที่ช่องกรอกตัวเลขเดิม
- [x] แสดง Hint คำแนะนำเกณฑ์สรรพากรและเงื่อนไขกรณีคู่สมรสไม่มีเงินได้ใต้ตัวเลือกอย่างชัดเจน
- [x] คำนวณยอดเงินลดหย่อนบิดามารดาอัตโนมัติ (จำนวนคนที่เลือก x 30,000 บาท) และสะท้อนไปยังผลการคำนวณภาษีทันที
- [x] เพิ่มคอลัมน์ `parent_own_father`, `parent_own_mother`, `parent_spouse_father`, `parent_spouse_mother` ในตาราง `tax_records` ผ่าน Non-destructive Auto-migration
- [x] ปรับปรุง API `POST /calculate` และ `GET /history` ให้บันทึกและส่งคืนสถานะ Checkbox ทั้ง 4 รายการ
- [x] เมื่อล็อกอินเข้าสู่ระบบและโหลดประวัติการคำนวณ ฟอร์มสามารถกู้คืนสถานะ Checkbox ของบิดามารดาได้ตรงตามที่บันทึกไว้
- [x] เพิ่ม Unit Test ใน `test/taxEngine.test.js` ครอบคลุมการคำนวณลดหย่อนบิดามารดา 0 ถึง 4 คน
