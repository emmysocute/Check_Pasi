# Specification: ระบบ Responsive Layout และ Mobile Navigation (TaxMe)

**Status:** Ready for Review / Agent Ready  
**Reference ADR:** [docs/adr/0002-responsive-and-mobile-layout.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/adr/0002-responsive-and-mobile-layout.md)  
**Domain Glossary:** [docs/glossary.md](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/docs/glossary.md)  

---

## Problem Statement

ผู้ใช้งานระบบ Check Pasi (TaxMe) ที่เปิดใช้งานผ่านโทรศัพท์มือถือและแท็บเล็ต พบปัญหาความไม่สะดวกในการใช้งานอย่างมีนัยสำคัญ:
1. **เมนูนำทางสูญหาย (Navigation Loss):** เมื่อหน้าจอมีความกว้างต่ำกว่า 768px แถบ Sidebar จะถูกซ่อนทั้งหมดโดยไม่มีเมนูทางเลือก ทำให้ผู้ใช้ไม่สามารถเปลี่ยนหน้า (คำนวณภาษี, ประวัติ, โปรไฟล์) ได้
2. **Topbar ล้นและทับซ้อน (Header Overflow):** การแสดงผลชื่อผู้ใช้, สโลแกน และปุ่มออกจากระบบกินพื้นที่แนวนอนมากเกินไป ส่งผลให้หน้าจอแคบเกิดการเบียดหรือล้นจอ
3. **แดชบอร์ดหน้าแรกบีบอัด (Distorted Dashboard):** หน้า HomePage กำหนด 2 คอลัมน์แบบตายตัว ทำให้การ์ดและกราฟสัดส่วนภาษี (Recharts) เสียสัดส่วนบนหน้าจอมือถือ
4. **ตารางประวัติตกขอบ (Unresponsive Data Table):** หน้า HistoryPage มีคอลัมน์ตารางหลายช่อง เมื่อเปิดบนมือถือข้อมูลและปุ่มคำสั่งจะล้นตกขอบจอ
5. **ความยาวของหน้าคำนวณภาษี (Long Form Friction):** แบบฟอร์มคำนวณภาษีมีความยาว ทำให้การเลื่อนลงไปดูผลลัพธ์ภาษีสุทธิต้องใช้เวลาปัดหน้าจอลึก

---

## Solution

ปรับปรุงโครงสร้างของระบบ TaxMe ให้รองรับทุกขนาดหน้าจออย่างสมบูรณ์แบบตามมาตรฐาน Responsive Web Design:
1. **Mobile Drawer (Off-Canvas):** ติดตั้งปุ่ม Hamburger บน Topbar เพื่อเปิด-ปิดเมนูนำทางด้านข้างที่สไลด์เข้า-ออกอย่างนุ่มนวล พร้อม Backdrop Overlay ที่แตะเพื่อปิดได้ และระบบปิดเมนูอัตโนมัติเมื่อเปลี่ยนหน้า
2. **Compact Responsive Topbar:** ซ่อนข้อความสโลแกนยาว และย่อการแสดงผลข้อมูลผู้ใช้ให้กะทัดรัดบนหน้าจอขนาดเล็ก ป้องกันการล้นจอ
3. **Adaptive Dashboard Grid:** ปรับเลย์เอาต์หน้าหลักให้แสดงผล 2 คอลัมน์บน Desktop และพับเป็น 1 คอลัมน์เรียงเดี่ยวบน Mobile เพื่อให้อ่านง่าย
4. **Floating Quick-Jump Bar:** เพิ่มปุ่มลอยด้านล่างของหน้า Tax Calculator บนมือถือ แสดงยอดภาษีประมาณการแบบสด พร้อมแตะเพื่อ Smooth Scroll ไปยังส่วนผลลัพธ์ได้ทันที
5. **Dual-View History System:** นำเสนอข้อมูลประวัติภาษีแบบตารางพร้อม Horizontal Scroll บน Desktop และสลับเป็น Adaptive Card View บนหน้าจอมือถือ
6. **Optimized Touch Spacing:** ปรับ Padding และขนาดของฟอร์มในหน้า Profile, Login และ Register ให้พอดีกับหน้าจอขนาดเล็ก (320px+) โดยไม่ติดขอบ

---

## User Stories

1. As a mobile user, I want to tap a hamburger icon on the topbar, so that I can open the navigation menu on my smartphone.
2. As a mobile user, I want the sidebar to slide in smoothly from the left with a darkened backdrop, so that I have clear visual focus on navigation.
3. As a mobile user, I want the navigation drawer to close automatically when I tap any navigation link, so that I am immediately presented with the destination page.
4. As a mobile user, I want to dismiss the drawer by tapping either the close button (✕) or anywhere on the backdrop overlay, so that I can quickly return to my previous view.
5. As a smartphone user, I want the topbar elements not to exceed the viewport width, so that the screen does not produce unintended horizontal scrolling.
6. As a mobile user visiting the home dashboard, I want the summary metrics and the pie chart to stack vertically into one column, so that graphs and numbers remain legible and properly sized.
7. As a taxpayer filling out income and deduction forms on mobile, I want a persistent floating quick-jump button showing my current estimated tax, so that I can see tax updates in real time without scrolling.
8. As a taxpayer on mobile, I want to tap the floating quick-jump button, so that the page smoothly scrolls directly to the result panel.
9. As a mobile user viewing my tax calculation history, I want each calculation record displayed as an individual card, so that I can review dates, annual incomes, deductions, and tax amounts comfortably.
10. As a mobile user, I want an easily accessible delete button on each history card, so that I can manage my records accurately with single-finger taps.
11. As a tablet user (768px - 1023px), I want the layout to adapt gracefully without awkward icon-only clipping, so that my viewing experience is comfortable and uncluttered.
12. As a desktop user (≥ 1024px), I want the full sidebar permanently visible on the left, so that I can navigate with zero extra clicks.
13. As a desktop user, I want calculation history to display as a full multi-column table, so that I can compare multiple past calculations side by side.
14. As a user accessing the profile page on a mobile device, I want the personal information and password cards to feature responsive padding, so that the inputs fit neatly within the display.
15. As a user logging in or registering on mobile, I want the authentication card to scale appropriately without touching the screen edges, so that input fields and submit buttons are easy to tap.

---

## Implementation Decisions

- **Layout Structure & State Management:** จัดการ State การเปิด-ปิด Drawer ในระดับ `AppLayout` (`src/App.jsx`) พร้อม Hook `useLocation` เพื่อดักจับ Route Change แล้วสั่งปิด Drawer อัตโนมัติ
- **Breakpoint Vocabulary:** กำหนด Breakpoints เป็นมาตรฐาน 4 ระดับใน `src/index.css`:
  - Desktop Large: `> 1023px` (Sidebar คงที่ 220px, Grid 2 คอลัมน์)
  - Tablet / Screen กลาง: `768px – 1023px` (เปิดใช้งาน Drawer, คอลัมน์เดียว)
  - Mobile: `< 768px` (Topbar ย่อขนาด, Dashboard 1 คอลัมน์, History Card View, Floating Button)
  - Extra Small Mobile: `< 480px` (ซ่อน Bell Icon, ปรับลดขนาด Padding ฟอร์ม)
- **Quick-Jump Interaction:** ใช้ Browser Native API `element.scrollIntoView({ behavior: 'smooth' })` เชื่อมระหว่าง Floating Button กับ Container `#tax-result-section`
- **History Dual Presentation:** ใช้วิธี CSS-driven dual structure (`.history-desktop-view` และ `.history-mobile-cards`) เพื่อให้การสลับโหมดไม่ต้องโหลดข้อมูลใหม่และไม่มี Layout shift
- **Aesthetic Guidelines:** รักษาโทนสีน้ำเงิน-เทาตาม Design System เดิม (`--primary-500` ถึง `--primary-700`) มีเงาละมุน (Soft Shadow) และ Backdrop Blur สำหรับ Drawer

---

## Testing Decisions

### Proposed Test Seams
- **Primary Seam (Single Highest Seam):** **End-to-End Viewport Simulation Test**
  - เหตุผล: การทดสอบความถูกต้องของ Responsive และ Mobile Navigation ควรทดสอบที่ระดับพฤติกรรมภายนอกของผู้ใช้ (External Behavior) ผ่านขนาด Viewport จริง โดยไม่ผูกติดกับรายละเอียดภายใน

### External Behavior Test Cases
1. **Mobile Viewport Test (width: 375px - 414px):**
   - ตรวจสอบว่า `.hamburger-btn` ปรากฏ และ `.sidebar` ซ่อนอยู่นอกจอ (`transform: translateX(-100%)`)
   - จำลองการกด `.hamburger-btn` -> ตรวจสอบว่า `.sidebar.open` และ `.sidebar-backdrop.active` ปรากฏ
   - จำลองการคลิกลิงก์เปลี่ยนหน้า -> ตรวจสอบว่าหน้าเปลี่ยนและ `.sidebar` ปิดกลับอัตโนมัติ
   - ตรวจสอบว่าหน้า Tax Calculator มี `.floating-quick-jump` ปรากฏ และกดแล้วหน้าจอเลื่อนไปที่ `#tax-result-section`
   - ตรวจสอบว่าหน้า History แสดง `.history-mobile-cards` และซ่อน `.history-desktop-view`
   - ตรวจสอบว่าไม่มี Horizontal Body Overflow (`document.body.scrollWidth === window.innerWidth`)
2. **Desktop Viewport Test (width: ≥ 1024px):**
   - ตรวจสอบว่า `.sidebar` ปรากฏคงที่ทางซ้าย (`margin-left: 220px` บน Main Content)
   - ตรวจสอบว่า `.hamburger-btn` และปุ่มปิด `✕` ไม่แสดงผล (`display: none`)
   - ตรวจสอบว่าหน้า History แสดง `.history-table` ใน `.history-desktop-view`

---

## Out of Scope

- การติดตั้ง Service Worker สำหรับ Progressive Web App (PWA) Offline Mode
- การเพิ่ม Dark Mode Theme Toggle
- การทำ Native Application (iOS / Android)
- การ Export ข้อมูลประวัติภาษีออกมาเป็น PDF หรือ Excel บนมือถือ

---

## Further Notes

- เอกสารนี้สังเคราะห์ขึ้นจากผลการสัมภาษณ์และปรับปรุงผ่าน `/grill-with-docs`
- โค้ดทั้งหมดได้รับการนำไปปรับใช้ใน Repository เรียบร้อยแล้ว และผ่านการตรวจสอบความสอดคล้องกับข้อกำหนดทุกข้อ
