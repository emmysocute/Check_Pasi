# ADR 0005: การยกระดับ Responsive ข้ามทุกอุปกรณ์และการเสริมความชัดเจนด้าน UX/UI

## สถานะ (Status)
อนุมัติแล้ว (Accepted)

## บริบท (Context)
หลังจากการทำ Code Review และการตรวจสอบ Responsive Layout ทั่วทั้งระบบ พบจุดที่ควรปรับปรุงเพื่อป้องกันการแตกของเลย์เอาต์และการสื่อสารข้อมูลกับผู้ใช้ให้ชัดเจนยิ่งขึ้น:

1. **Responsive Text Collision บนหน้าจอมือถือเล็ก (<= 479px):**
   - ข้อความชื่อบิดามารดาและยอดเงินพร้อมเงื่อนไข `+30,000 บ. (คู่สมรสไม่มีเงินได้)` ใน `.parent-check-text` ใช้ `display: flex; justify-content: space-between;` ทำให้บนหน้าจอแคบ (เช่น iPhone SE หรือ Android จอเล็ก) เกิดปัญหาข้อความเบียดหรือล้นกรอบ
2. **Tax Bracket Table บนจอมือถือ:**
   - ตารางแจกแจง 8 ขั้นภาษี (`.bracket-table`) มี 4 คอลัมน์ หากเปิดดูบนหน้าจอที่แคบกว่า 360px อาจเกิดการบีบคอลัมน์หรือล้นกรอบโดยไม่มีตัวเลื่อนแนวนอน
3. **ความไม่สมดุลของ Grid บน Tablet และ Desktop (>= 768px):**
   - การ์ดบิดามารดามีทั้ง Checkbox 4 รายการ, ยอดรวม และ Hint 4 ข้อ ทำให้มีความสูงมากกว่าการ์ดลดหย่อนอื่นที่อยู่ติดกัน เกิดพื้นที่ว่างสีขาวใต้การ์ดข้างๆ
4. **ความชัดเจนด้าน UI/UX (Feedback & Statutory Compliance):**
   - Checkbox บิดามารดาที่ถูกเลือก ขาดสีไฮไลท์พื้นหลังและกรอบเพื่อบอกสถานะที่ชัดเจน (Active Checked State)
   - ช่องเงินบริจาคการศึกษา (สิทธิ 2 เท่า) ผู้ใช้กรอกยอดจ่ายจริง แต่ไม่มีป้ายแจ้งให้เห็นชัดเจนว่าได้รับสิทธิหักลดหย่อนเป็น 2 เท่าทันที
   - หากผู้ใช้เลือกบิดามารดาของคู่สมรส แต่ยังไม่ได้เปิดใช้งาน "ลดหย่อนคู่สมรส 60,000 บาท" ขาดคำแนะนำเชิงภาษีที่ช่วยให้ผู้ใช้ไม่พลาดสิทธิลดหย่อนที่เกี่ยวข้อง
   - ในหน้า History ขาดปุ่มโหลดข้อมูลในอดีตขึ้นมาคำนวณใหม่ในฟอร์ม

## การตัดสินใจ (Decision)

### 1. ปรับปรุง Responsive Layout ใน `src/index.css`
- สำหรับจอมือถือเล็ก (`@media (max-width: 479px)`): กำหนดให้ `.parent-check-text` เปลี่ยนเป็น `flex-direction: column; align-items: flex-start; gap: 2px;`
- เพิ่ม `overflow-x: auto; -webkit-overflow-scrolling: touch;` ใน `.accordion-content` สำหรับตารางแจกแจงขั้นบันไดภาษี
- สำหรับจอ Tablet/Desktop (`@media (min-width: 768px)`): กำหนดให้ `.deduction-item.parent-allowance-item` ขยายเต็มพื้นที่ 2 คอลัมน์ (`grid-column: 1 / -1;`) เพื่อความสมดุลของ Layout

### 2. ยกระดับ Visual Feedback และคำแนะนำภาษี (UX Polish)
- เพิ่มสไตล์ไฮไลท์ `.parent-check-item.is-checked` และ `:has(input:checked)` เป็นพื้นหลังสีเขียวอ่อน (`#f0fdf4`) และกรอบสีเขียวเพื่อบอกสถานะอย่างชัดเจน
- เพิ่มป้ายแสดงสิทธิลดหย่อน 2 เท่า (`.donation-double-badge`) แบบ Real-time ใต้ช่องกรอกเงินบริจาคการศึกษา
- เพิ่ม Smart Contextual Tip (`.parent-smart-tip`) แจ้งเตือนสิทธิลดหย่อนคู่สมรส 60,000 บาท เมื่อมีการเลือกบิดา/มารดาคู่สมรส
- ปรับสีตัวอักษรของ `.parent-disabled-preview` เป็น `var(--gray-600)` เพื่อให้ได้ตามเกณฑ์ Contrast Ratio ของ WCAG AA (>= 4.5:1)

### 3. เพิ่มฟังก์ชัน "ใช้ข้อมูลนี้" / โหลดประวัติเข้าฟอร์ม
- เพิ่มปุ่ม "ใช้ข้อมูลนี้" (`.history-action-load`, `.history-card-load-btn`) ใน [`src/pages/HistoryPage.jsx`](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/src/pages/HistoryPage.jsx)
- เพิ่มการรับ `location.state.loadRecord` ใน [`src/pages/TaxCalculatorPage.jsx`](file:///c:/kmitl/PEE3/Cloude/project/Check_Pasi/src/pages/TaxCalculatorPage.jsx) เพื่อกู้คืนข้อมูลเข้าฟอร์มทันที

## ผลลัพธ์ (Consequences)
- การแสดงผลหน้าเว็บสวยงาม ไม่แตกหรือล้นกรอบบนทุกอุปกรณ์ (Mobile, Tablet, Desktop)
- ผู้ใช้ได้รับประสบการณ์การใช้งาน (UX) ที่สะดวก มีคำแนะนำครบถ้วน และประหยัดเวลาในการวางแผนภาษี
