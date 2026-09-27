# 05: Responsive Forms & Touch Spacing for Profile and Auth

**What to build:**
ผู้ใช้งานบนอุปกรณ์หน้าจอขนาดเล็ก (ตั้งแต่ 320px ขึ้นไป) สามารถใช้งานหน้าโปรไฟล์ (ProfilePage), หน้าเข้าสู่ระบบ (LoginPage) และหน้าลงทะเบียน (RegisterPage) ได้อย่างราบรื่น โดยการ์ดแบบฟอร์มมีระยะเว้นขอบที่พอดี ไม่เบียดติดขอบจอ ฟอร์มแบบ 2 คอลัมน์พับเป็น 1 คอลัมน์บนมือถือเพื่อให้ช่องกรอกมีขนาดกว้างพอสำหรับแป้นพิมพ์เสมือนจริง และไม่มีแถบเลื่อนแนวนอนของหน้าจอหลักหลุดออกมา

**Blocked by:** 01: Mobile Navigation Drawer and Compact Topbar

**Status:** completed

- [x] หน้า ProfilePage มีระยะขอบแบบ Responsive Padding สำหรับหน้าจอมือถือ
- [x] กริดแบบฟอร์ม 2 คอลัมน์ใน ProfilePage พับลงมาเป็น 1 คอลัมน์บนหน้าจอแคบ (≤ 640px)
- [x] หน้า LoginPage และ RegisterPage มีการปรับขอบและช่องว่างของการ์ดฟอร์มบนหน้าจอ ≤ 480px ให้ไม่ล้นจอ
- [x] แถบ Footer ด้านล่างปรับระยะห่างและจัดข้อความกึ่งกลางบนมือถือ โดยไม่มีปัญหา `margin-left` ซ้ำซ้อน
- [x] หน้าเว็บทั้งหมดไม่มีอาการ Horizontal Body Overflow (`scrollWidth === innerWidth`) บนทุกขนาดหน้าจอ
