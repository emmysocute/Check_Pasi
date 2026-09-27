# 01: Drawer Keyboard Accessibility and Body Scroll Lock

**What to build:**
เมื่อเมนู Mobile Drawer เปิดใช้งานบนหน้าจอ ผู้ใช้สามารถกดปุ่ม `Escape` บนคีย์บอร์ดเพื่อสั่งปิด Drawer ได้ทันทีโดยไม่ต้องแตะหน้าจอ พร้อมทั้งมีการล็อกการเลื่อนของหน้าเว็บหลัก (`document.body.style.overflow = 'hidden'`) เพื่อป้องกันการเลื่อนตามขณะผู้ใช้นิ้วปัดเมนู และเมื่อ Drawer ปิดลงหรือ Component ถูกถอดออก (Unmount) จะทำการคืนค่าการเลื่อนของหน้าจอและยกเลิก Event Listener อย่างปลอดภัย

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] เมื่อ Drawer เปิดอยู่ (`isOpen === true`) ผู้ใช้กดปุ่ม `Escape` บนคีย์บอร์ดแล้ว Drawer จะปิดลงทันที
- [x] เมื่อ Drawer เปิดอยู่ หน้าจอหลักจะไม่สามารถเลื่อนตามได้ (`document.body.style.overflow === 'hidden'`)
- [x] เมื่อ Drawer ปิดลง ค่า `overflow` ของ `document.body` จะถูกคืนกลับสู่ค่าปกติ
- [x] มีการทำ Cleanup Event Listener และคืนค่าสไตล์ของ `body` เสมอเมื่อ Component Unmount เพื่อป้องกัน Memory Leak
