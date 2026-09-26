# ADR 0001: ระบบแก้ไขข้อมูลส่วนตัว เปลี่ยนรหัสผ่าน และปรับปรุง Alert UI

## สถานะ (Status)
อนุมัติแล้ว (Accepted)

## บริบท (Context)
ระบบ Check Pasi เดิมมีเพียงข้อมูลพื้นฐานในโปรไฟล์ (`display_name`, `phone`, `address`, `tax_id`) และยังไม่มีระบบให้ผู้ใช้งานเปลี่ยนรหัสผ่านได้เมื่อต้องการเปลี่ยนความปลอดภัย อีกทั้ง UI การแจ้งเตือนข้อผิดพลาดในหน้าแบบฟอร์ม (Login, Register, Profile) ยังเป็นเพียงข้อความสีแดงเรียบๆ ไม่มีสไตล์ที่ชัดเจน

ผู้ใช้งานต้องการ:
1. ปรับปรุงหน้าตั้งค่าโปรไฟล์ให้รองรับข้อมูลส่วนตัวเพิ่มเติม ได้แก่ ชื่อจริง (`first_name`) และนามสกุล (`last_name`)
2. เพิ่มฟังก์ชันการเปลี่ยนรหัสผ่าน (Change Password) ภายในหน้าโปรไฟล์ โดยต้องตรวจสอบรหัสผ่านเดิมก่อนเปลี่ยนเป็นรหัสผ่านใหม่
3. ปรับปรุง UI การแจ้งเตือนในแบบฟอร์ม (Alert Card) ให้ดูโมเดิร์น สวยงาม สีนุ่มนวล พร้อมไอคอนประกอบ

## การตัดสินใจ (Decision)

### 1. โครงสร้างฐานข้อมูล (Database Schema)
- คงฟิลด์ `display_name` ในตาราง `users` ไว้สำหรับการแสดงผลหลักบนแถบเมนู (Topbar)
- เพิ่มคอลัมน์ `first_name VARCHAR(100)` และ `last_name VARCHAR(100)` ในตาราง `user_profiles`
- ดำเนินการ Migration โครงสร้างฐานข้อมูลแบบ Non-destructive (`ADD COLUMN IF NOT EXISTS`)

### 2. Backend API
- **`PUT /api/user/profile`**:
  - รองรับฟิลด์: `firstName`, `lastName`, `displayName`, `phone`, `address`, `taxId`
  - ทำการอัปเดตทั้งตาราง `users` (`display_name`) และ `user_profiles` (`first_name`, `last_name`, `phone`, `address`, `tax_id`)
- **`PUT /api/user/change-password`**:
  - รับข้อมูล: `currentPassword`, `newPassword`
  - ตรวจสอบความถูกต้องของ `currentPassword` โดยเทียบ bcrypt กับ `users.password_hash`
  - ตรวจสอบความยาวรหัสผ่านใหม่ (ขั้นต่ำ 6 ตัวอักษร)
  - เข้ารหัสรหัสผ่านใหม่ด้วย bcrypt (`salt 10 rounds`) แล้วบันทึกลงฐานข้อมูล

### 3. Frontend & UI Design
- เพิ่มสไตล์ `.alert-card` ใน `src/index.css` ที่มีลักษณะ Modern Soft Alert:
  - สีนุ่มนวล (Soft tint background + subtle border + vibrant accent icon)
  - Animation เลื่อนเข้าแบบนุ่มนวล (`alertSlideIn`)
  - รองรับ variant: `error`, `success`, `info`
- ปรับปรุง `ProfilePage.jsx` ให้แบ่งออกเป็น 2 การ์ดอย่างเป็นระเบียบ:
  1. การ์ดข้อมูลส่วนตัว (ชื่อ-นามสกุล, ชื่อที่แสดง, ข้อมูลติดต่อ)
  2. การ์ดความปลอดภัยและรหัสผ่าน (เปลี่ยนรหัสผ่านพร้อมการตรวจสอบ)
- ปรับปรุง `LoginPage.jsx` และ `RegisterPage.jsx` ให้แสดงผล Alert Card เมื่อกรอกข้อมูลผิดพลาด พร้อมการตรวจสอบรูปแบบ Email ในฟอร์ม

## ผลลัพธ์ (Consequences)
- ผู้ใช้สามารถจัดการข้อมูลส่วนตัวได้ละเอียดและตรงตามความเป็นจริง
- เพิ่มความปลอดภัยให้บัญชีผู้ใช้ด้วยการเปลี่ยนรหัสผ่านได้เอง
- ยกระดับ UI/UX ของระบบให้ทันสมัย สวยงาม และสื่อสารกับผู้ใช้ได้ชัดเจนยิ่งขึ้น
