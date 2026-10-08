# 05: History, Dashboard Net Status Integration, and Form Reset Confirmation

**What to build:** 
ยกระดับหน้าประวัติการคำนวณ (HistoryPage) และหน้าแรกแดชบอร์ด (HomePage) ให้แสดงสถานะสุทธิของการคำนวณแต่ละครั้งอย่างสมบูรณ์แบบ โดยมีป้าย Badge บอกสถานะ "ขอคืนภาษี" (สีเขียว) หรือ "ชำระภาษีเพิ่ม" (สีส้ม/แดง), แสดงสถิติและ Pie Chart ที่ถูกต้องตามหลักการเงินในหน้าแรก และเพิ่มกล่อง Modal ยืนยันการล้างข้อมูล (Confirm Clear Form) ในหน้าคำนวณภาษีเพื่อป้องกันไม่ให้ผู้ใช้เผลอกดล้างข้อมูลโดยไม่ตั้งใจ

**Blocked by:** 02: Withholding Tax, Tax Refund/Payable Differentiation, and Modern Toast Notifications, 03: Extended Deductions (Home Loan Interest, Parent Allowance, and Charitable Donations), 04: Section 48(2) Flat Rate Tax Evaluation & Collapsible Tax Bracket Breakdown

**Status:** closed

- [x] ปรับปรุง HistoryPage (ทั้งตาราง Desktop และการ์ด Mobile) ให้แสดงยอดภาษีหัก ณ ที่จ่าย และ Badge สถานะ "ขอคืนภาษี" หรือ "ชำระเพิ่ม"
- [x] ปรับปรุง HomePage แดชบอร์ดสรุปสถิติให้แสดงยอดเงินคืนภาษีสะสม หรือภาษีที่ต้องชำระล่าสุดอย่างถูกต้อง
- [x] ปรับแต่ง Pie Chart ใน HomePage ให้แสดงสัดส่วน Take-home, Deductions, และ Tax อย่างสวยงามและถูกต้อง
- [x] เพิ่ม Confirmation Modal หรือ Dialog ยืนยันก่อนดำเนินการเมื่อผู้ใช้กดปุ่ม "ล้างข้อมูล" ในหน้าคำนวณภาษี
- [x] ทำความสะอาด Lint Warnings และตรวจสอบว่า Production Build ผ่านฉลุย 100%
