# 02: Calculator Safe Bottom Clearance for Floating Bar

**What to build:**
ในหน้าคำนวณภาษี (Tax Calculator) บนอุปกรณ์มือถือ (`< 768px`) มีการเพิ่มระยะปลอดภัยด้านล่าง (Bottom Safe Clearance ~ 84px) ให้กับคอนเทนเนอร์ของหน้า เพื่อรับประกันว่าปุ่มลอย Floating Quick-Jump จะไม่บดบังปุ่ม "บันทึก", ปุ่ม "ล้างข้อมูล" หรือการ์ดสรุปผลลัพธ์ภาษีเมื่อผู้ใช้เลื่อนหน้าจอลงมาจนสุด

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] คอนเทนเนอร์หน้า Tax Calculator มีระยะ `padding-bottom: 84px` บนหน้าจอขนาด `< 768px`
- [x] เมื่อเลื่อนหน้าจอลงมาล่างสุด ปุ่ม "ล้างข้อมูล", "บันทึก" และการ์ดแสดงผลภาษี จะลอยอยู่เหนือแถบ Floating Quick-Jump Bar ไม่ถูกทับซ้อน
- [x] บนหน้าจอ Desktop (≥ 768px) ระยะขอบด้านล่างจะกลับเป็นค่ามาตรฐานปกติ
