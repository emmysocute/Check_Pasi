# Specification: การปรับปรุงการเข้าถึง (A11y), Scroll Lock และระยะปลอดภัยบนมือถือ

**Status:** Ready for Review / Agent Ready  
**Reference ADR:** [docs/adr/0002-responsive-and-mobile-layout.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/adr/0002-responsive-and-mobile-layout.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/glossary.md)  

---

## Problem Statement

หลังจากการติดตั้งระบบ Responsive Layout และ Mobile Drawer มีจุดที่ส่งผลต่อประสบการณ์ผู้ใช้ (UX) และมาตรฐานการเข้าถึง (A11y) ที่ควรได้รับการยกระดับเพิ่มเติม:
1. **การขาดคีย์บอร์ดชอร์ตคัตสำหรับปิด Drawer:** ผู้ใช้งานที่เชื่อมต่อคีย์บอร์ดภายนอกเข้ากับแท็บเล็ตหรือสมาร์ตโฟน ไม่สามารถกดปุ่ม `Escape` เพื่อปิดเมนูนำทาง Drawer ได้ ซึ่งขัดกับมาตรฐาน Web Accessibility (A11y)
2. **ปัญหาฉากหลังเลื่อนตาม (Background Scroll Bleed):** เมื่อเมนู Mobile Drawer เปิดอยู่ หากผู้ใช้นิ้วปัดเลื่อนเมนูจนสุด จะทำให้หน้าเว็บหลักด้านหลังเลื่อนตามไปด้วย (Scroll Chaining) ทำให้ผู้ใช้สูญเสียตำแหน่งหน้าเว็บเดิม
3. **การบดบังเนื้อหาแถวล่างสุดโดยปุ่มลอย:** ในหน้าคำนวณภาษี (Tax Calculator) ปุ่ม Floating Quick-Jump ถูกตรึงไว้ที่ตำแหน่งล่างสุดของจอ (`bottom: 24px`) เมื่อผู้ใช้เลื่อนหน้าจอลงมาจนสุด อาจทำให้ปุ่มลอยนี้บดบังปุ่ม "บันทึก" หรือข้อความในส่วนท้ายสุดได้

---

## Solution

ดำเนินการปรับปรุงความสมบูรณ์แบบ 3 ส่วนหลัก:
1. **Keyboard Accessibility for Drawer:** เพิ่ม Event Listener ดักจับปุ่ม `Escape` บนคีย์บอร์ด ขณะที่ Drawer กำลังเปิดอยู่ เพื่อสั่งปิดเมนูทันที และมีระบบ Cleanup Event Listener ทุกครั้งเมื่อ Drawer ปิดหรือ Component Unmount
2. **Body Scroll Lock Mechanism:** สั่งล็อกการเลื่อนของ `document.body` (`overflow: hidden`) อัตโนมัติเมื่อ Mobile Drawer เปิดใช้งาน และคืนค่าการเลื่อนเดิมกลับมาอย่างปลอดภัยเมื่อ Drawer ปิดลง
3. **Safe Bottom Spacing for Floating Bar:** เพิ่มระยะเว้นขอบล่าง (Bottom Safe Padding: 76px - 84px) สำหรับหน้าคำนวณภาษีบนอุปกรณ์มือถือ เพื่อให้ผู้ใช้สามารถเลื่อนดูเนื้อหาและกดปุ่มด้านล่างสุดได้ครบถ้วนโดยไม่ถูกปุ่มลอยบดบัง

---

## User Stories

1. As a keyboard or tablet user, I want to press the Escape key to close the mobile navigation drawer, so that I can dismiss the menu quickly without lifting my hands to touch the screen.
2. As a mobile touchscreen user, I want background page scrolling to be completely locked while the drawer is open, so that swiping through menu links does not drag the page behind it.
3. As a mobile touchscreen user, I want background page scrolling to be immediately restored when the drawer closes, so that I can resume interacting with the underlying page without refresh.
4. As a mobile user calculating my taxes, I want sufficient breathing room at the bottom of the form and result panel, so that the floating quick-jump button never blocks the "บันทึก" button or footer credits.
5. As a developer and end-user, I want all keyboard listeners and body style overrides to be cleaned up safely on component unmount or route change, so that the web application never retains memory leaks or stuck scrollbars.

---

## Implementation Decisions

- **Keyboard Listener Seam:** ผูก Event Listener กับ `window` ภายใน Component ที่ควบคุม Drawer (`Sidebar`) โดยรันเฉพาะเมื่อ `isOpen === true` และคืนค่า Cleanup Function ใน Effect
- **Scroll Lock Lifecycle:** ควบคุม `document.body.style.overflow` ควบคู่กับ State การเปิด Drawer เมื่อ `isOpen` เป็นจริงให้ตั้งเป็น `'hidden'` และเมื่อ `isOpen` เป็นเท็จ (หรือ Unmount) ให้คืนค่าเป็น `''` (หรือค่าเดิม)
- **CSS Safe Area Spacing:** เพิ่มคลาสหรือ Media Query ใน `src/index.css` สำหรับ `.content-area` หรือ Container ที่มีปุ่มลอยบนหน้าจอขนาด `< 768px` ให้มี `padding-bottom: 84px` เพื่อสร้าง Safe Clearance

---

## Testing Decisions

### Proposed Test Seams
- **Single Highest Seam:** **Component Lifecycle & Viewport Interaction Test**
  - เหตุผล: สามารถตรวจสอบทั้งพฤติกรรมการกดปุ่ม `Escape`, การเปลี่ยนสไตล์ของ `document.body`, และการเรนเดอร์ Safe Margin บนหน้าจอขนาดจริง

### Test Cases
1. **Keyboard Escape Test:**
   - จำลองเปิด Mobile Drawer (`isOpen = true`)
   - จำลองการกดปุ่ม `{ key: 'Escape' }`
   - ตรวจสอบว่าฟังก์ชัน `onClose` ถูกเรียกใช้งานทันที
2. **Body Scroll Lock Test:**
   - เมื่อ Mobile Drawer เปิด -> ตรวจสอบว่า `document.body.style.overflow === 'hidden'`
   - เมื่อ Mobile Drawer ปิด -> ตรวจสอบว่า `document.body.style.overflow` คืนค่าว่างหรือค่าเดิม
3. **Safe Bottom Spacing Test:**
   - ที่หน้าจอ Viewport `< 768px` บนหน้า Tax Calculator -> ตรวจสอบว่าคอนเทนเนอร์มีระยะ `padding-bottom ≥ 80px`
   - ตรวจสอบว่าปุ่ม Action และ Result Card บรรทัดล่างสุดอยู่เหนือแถบ Floating Quick-Jump

---

## Out of Scope

- การติดตั้ง Focus-Trap Library ขนาดใหญ่ (คงขนาด Bundle ให้เบาที่สุด)
- การทำ Gesture Physics สไลด์ลากนิ้วตามนิ้วมือ (Swipe to Dismiss)

---

## Further Notes

- การปรับปรุงนี้ช่วยให้ระบบสอดคล้องกับมาตรฐาน WCAG 2.1 (Keyboard Accessible) และยกระดับประสบการณ์ผู้ใช้บนสมาร์ตโฟนและแท็บเล็ตให้ราบรื่นยิ่งขึ้น
