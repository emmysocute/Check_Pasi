# 03: Dual-Rate Donation Persistence and State Recovery Full Vertical Slice

**What to build:** 
ขยายระบบจัดเก็บเงินบริจาคใน PostgreSQL ให้แยกเป็น 2 คอลัมน์ `donation_education` (สิทธิ 2 เท่า) และ `donation_general` (สิทธิ 1 เท่า) พร้อมปรับปรุง API `POST /calculate` และ `GET /history` ให้จัดเก็บและกู้คืนค่าเงินบริจาคทั้งสองประเภทกลับมาแสดงผลในฟอร์มคำนวณภาษีได้อย่างสมบูรณ์ โดยไม่สูญเสียสิทธิลดหย่อน 2 เท่าเมื่อผู้ใช้กลับมาดูประวัติการคำนวณเดิม

**Blocked by:** 01: Shared Input Sanitization and Keypress Guards (Prefactoring)

**Status:** ready-for-agent

- [ ] เพิ่มคอลัมน์ `donation_education` และ `donation_general` ในตาราง `tax_records` ผ่าน Non-destructive Auto-migration
- [ ] คอลัมน์ `donation` เดิมยังคงจัดเก็บยอดรวมลดหย่อนจริงหลัง Cap 10% ตามปกติเพื่อ backward compatibility
- [ ] ปรับปรุง API `POST /calculate` ให้รับและบันทึกค่า `donationEducation` และ `donationGeneral` ลงฐานข้อมูล
- [ ] ปรับปรุง API `GET /history` ให้ส่งคืนข้อมูลทั้งสองคอลัมน์
- [ ] ปรับปรุงการกู้คืนข้อมูลใน TaxCalculatorPage (`fetchLatest`) ให้ฟื้นฟูค่าเงินบริจาค 2 เท่าและ 1 เท่าลงในแบบฟอร์มได้ถูกต้อง
- [ ] เพิ่ม Unit Test ใน `test/taxEngine.test.js` ยืนยันความถูกต้องของการคำนวณเงินบริจาคทั้งสองประเภท
- [ ] ตรวจสอบว่า `npm test`, `npm run lint`, และ `npm run build` ผ่าน 100%
