# 04: Section 48(2) Flat Rate Tax Evaluation & Collapsible Tax Bracket Breakdown

**What to build:** 
สำหรับผู้มีเงินได้ฟรีแลนซ์/อื่นๆ เกิน 120,000 บาทต่อปี ระบบจะทำการคำนวณเปรียบเทียบภาษีวิธีที่ 2 (อัตราเหมา 0.5% ตาม ม.48(2)) กับวิธีอัตราก้าวหน้าขั้นบันไดอัตโนมัติ หากวิธีที่ 2 สูงกว่าและเกิน 5,000 บาท ระบบจะบังคับใช้ภาษีวิธีที่ 2 พร้อมแสดง Badge แจ้งเตือนผู้ใช้อย่างชัดเจน และใน ResultPanel เพิ่มตารางแจกแจงขั้นบันไดภาษี 8 ขั้น (Tax Bracket Breakdown) ในรูปแบบ Accordion ที่กดคลี่ดู/พับเก็บได้ พร้อมไฮไลต์ฐานภาษีสูงสุดของผู้ใช้ (Marginal Tax Bracket)

**Blocked by:** 01: Pure Domain Tax Engine Extraction, 02: Withholding Tax, Tax Refund/Payable Differentiation, and Modern Toast Notifications

**Status:** closed

- [x] ตรวจสอบเงื่อนไข ม.48(2): หาก freelanceIncome > 120,000 บาท ให้คำนวณภาษีวิธีเหมา 0.5%
- [x] เปรียบเทียบภาษีวิธีที่ 1 (ขั้นบันได) และวิธีที่ 2 (เหมา 0.5%) หากวิธีที่ 2 มากกว่าและคำนวณได้เกิน 5,000 บาท ให้เลือกใช้ภาษีตามวิธีที่ 2
- [x] แสดง Badge ข้อมูลใน ResultPanel แจ้งว่าคำนวณด้วยวิธีใด (เช่น "คำนวณตามอัตราก้าวหน้าทั่วไป" หรือ "คำนวณตามวิธีเหมา 0.5% ม.48(2)")
- [x] เพิ่มคอลัมน์ `tax_method VARCHAR(20) DEFAULT 'bracket'` ใน PostgreSQL
- [x] สร้างคอมโพเนนต์ Collapsible Tax Bracket Breakdown ใน ResultPanel แสดงเงินได้ที่ต้องเสียภาษีและยอดภาษีในแต่ละขั้นบันได 8 ขั้น
- [x] ไฮไลต์แถวอัตราภาษีสูงสุดของผู้ใช้ (Marginal Rate) เช่น "ฐานภาษีสูงสุดของคุณ: 10%" เพื่อช่วยวางแผนการเงิน
