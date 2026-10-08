# 01: Shared Input Sanitization and Keypress Guards (Prefactoring)

**What to build:** 
สกัดฟังก์ชันดักคีย์อักขระพิเศษ (`blockInvalidChars`) และฟังก์ชันตรวจสอบ/จำกัดค่าตัวเลขบวกไม่ให้ติดลบ (`sanitizeNumericInput`) เป็นโมดูล Utility กลางที่นำไปใช้ร่วมกันทั่วทั้งระบบ เพื่อกำจัดความซ้ำซ้อนของโค้ด (Duplicated Code Smell) ในคอมโพเนนต์กรอกข้อมูลรายได้และค่าลดหย่อน พร้อมทั้งมี Unit Test ครอบคลุมการทำงานอย่างรัดกุม

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] สร้างโมดูลกลางสำหรับดักคีย์ไม่ให้พิมพ์เครื่องหมายลบ, บวก, และตัวอักษร 'e', 'E'
- [x] สร้างฟังก์ชันแปลงและจำกัดช่วงตัวเลขให้อยู่ในขอบเขตที่ปลอดภัย ($\ge 0$ และไม่เกินเพดานสูงสุด)
- [x] นำโมดูลกลางไปใช้แทนที่โค้ดดักคีย์และแปลงตัวเลขเดิมใน IncomeSection และ DeductionSection
- [x] เพิ่มชุดทดสอบ Unit Test สำหรับ Shared Utility ให้ผ่าน 100%
- [x] ทุกหน้ายังคงทำงานได้ตามปกติโดยไม่มีพฤติกรรมถอยหลัง (No regression)
