# 🧮 Check Pasi - ระบบคำนวณภาษีเงินได้บุคคลธรรมดา

ระบบคำนวณภาษีเงินได้บุคคลธรรมดา พร้อมระบบจัดเก็บประวัติการคำนวณ

## 🏗️ System Architecture

```
Frontend (React + Vite)  ←→  Backend (Node.js + Express)  ←→  Database (PostgreSQL)
```

---

## 📂 Project Structure

### **Frontend (React Application)**

```
src/
├── components/          # ส่วนประกอบหลัก
├── pages/              # หน้าเว็บต่างๆ
├── contexts/           # Context providers
├── utils/              # ฟังก์ชันช่วยเหลือ
└── assets/            # ไฟล์สื่อต่างๆ
```

#### **📁 src/components/**
- **`WelcomeBanner.jsx`** - แบนเนอร์ต้อนรับหน้าแรก
- **`Topbar.jsx`** - แถบเมนูด้านบน พร้อมปุ่ม login/logout
- **`Sidebar.jsx`** - เมนูด้านข้าง (หน้าแรก, คำนวณภาษี, ประวัติ, โปรไฟล์)
- **`IncomeSection.jsx`** - ส่วนกรอกข้อมูลรายได้ (เงินเดือน, ฟรีแลนซ์)
- **`DeductionSection.jsx`** - ส่วนกรอกค่าลดหย่อน (บุคคล, คู่สมรส, ประกัน, ฯลฯ)
- **`ResultPanel.jsx`** - แสดงผลการคำนวณภาษี

#### **📁 src/pages/**
- **`HomePage.jsx`** - หน้าแรก/Dashboard
- **`LoginPage.jsx`** - หน้าเข้าสู่ระบบ
- **`RegisterPage.jsx`** - หน้าสมัครสมาชิก
- **`TaxCalculatorPage.jsx`** - **[หลัก]** หน้าคำนวณภาษี + บันทึกข้อมูล
- **`HistoryPage.jsx`** - หน้าประวัติการคำนวณ
- **`ProfilePage.jsx`** - หน้าข้อมูลส่วนตัว

#### **📁 src/contexts/**
- **`AuthContext.jsx`** - จัดการสถานะ Authentication (login/logout/user data)

#### **📁 src/utils/**
- **`api.js`** - ตัวจัดการ HTTP requests พร้อม JWT token

---

### **Backend (Node.js + Express API)**

```
server/
├── config/             # การตั้งค่าระบบ
├── middleware/         # Middleware functions
├── routes/             # API endpoints
├── package.json        # Dependencies
└── index.js           # Server entry point
```

#### **📁 server/config/**
- **`db.js`** - การเชื่อมต่อ PostgreSQL database
- **`schema.sql`** - Database schema (tables: users, tax_records, user_profiles)

#### **📁 server/middleware/**
- **`auth.js`** - JWT token verification middleware

#### **📁 server/routes/**
- **`auth.js`** - Authentication APIs (register, login, verify token)
- **`user.js`** - User management APIs (profile CRUD)
- **`tax.js`** - **[หลัก]** Tax calculation APIs (calculate & save, history, delete)

#### **📄 server/index.js**
- Express server setup
- Middleware configuration
- Route mounting
- CORS and security settings

---

## 🔄 Data Flow

### **1. การคำนวณภาษี**
```
User Input → TaxCalculatorPage → Tax Logic → ResultPanel → API Call → Database
```

### **2. Authentication Flow**
```
Login Form → API → JWT Token → AuthContext → Protected Routes
```

### **3. History Management**
```
Tax Calculation → Auto Save → Database → History API → HistoryPage Display
```

---

## 🛡️ Security Features

- **JWT Authentication** - Token-based user authentication
- **Password Hashing** - bcrypt สำหรับการเข้ารหัสรหัสผ่าน
- **CORS Protection** - จำกัด origin ที่อนุญาต
- **SQL Injection Prevention** - ใช้ parameterized queries
- **Authorization Middleware** - ตรวจสอบสิทธิ์ก่อนเข้าถึง API

---

## 🗄️ Database Schema

### **users table**
```sql
- id (Primary Key)
- email (Unique)
- password_hash
- display_name
- created_at, updated_at
```

### **tax_records table**
```sql
- id (Primary Key)
- user_id (Foreign Key)
- รายได้: monthly_income, freelance_income, employment_type
- ค่าลดหย่อน: personal_allowance, spouse_allowance, insurance, etc.
- ผลการคำนวณ: annual_income, total_deduction, net_income, tax_amount
- calculated_at (Timestamp)
```

### **user_profiles table**
```sql
- id (Primary Key)
- user_id (Foreign Key)
- phone, address, tax_id
- updated_at
```

---

## 📊 Tax Calculation Logic

### **อัตราภาษีปี 2568**
| รายได้สุทธิ (บาท) | อัตราภาษี |
|-------------------|-----------|
| 0 - 150,000       | 0%        |
| 150,001 - 300,000 | 5%        |
| 300,001 - 500,000 | 10%       |
| 500,001 - 750,000 | 15%       |
| 750,001 - 1,000,000 | 20%     |
| 1,000,001 - 2,000,000 | 25%   |
| 2,000,001 - 5,000,000 | 30%   |
| 5,000,001 ขึ้นไป    | 35%      |

### **การคำนวณ**
1. **รายได้รวม** = เงินเดือน × 12 + รายได้อื่น
2. **ค่าใช้จ่าย** = min(รายได้รวม × 50%, 100,000)
3. **รายได้สุทธิ** = รายได้รวม - ค่าใช้จ่าย - ค่าลดหย่อนรวม
4. **ภาษี** = คำนวณตามอัตราขั้นบันได

---

## 🚀 การติดตั้งและรัน

### **Prerequisites**
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### **Installation**

1. **Clone repository**
```bash
git clone <repository-url>
cd Check_Pasi
```

2. **Frontend setup**
```bash
npm install
cp .env.example .env
npm run dev
```

3. **Backend setup**
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

4. **Database setup**
```bash
# Create database
createdb check_pasi

# Run schema
psql check_pasi < server/config/schema.sql
```

### **Environment Variables**

#### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
```

#### **Backend (server/.env)**
```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/check_pasi
JWT_SECRET=your-super-secret-key
```

### **Docker (Optional)**
```bash
docker-compose up -d
```

---

## 🔧 การพัฒนาและแก้ไข

### **เพิ่ม API Endpoint ใหม่**
1. สร้างใน `server/routes/`
2. Mount route ใน `server/index.js`
3. เพิ่ม API call ใน `src/utils/api.js`

### **เพิ่มหน้าใหม่**
1. สร้าง component ใน `src/pages/`
2. เพิ่ม route ใน `src/App.jsx`
3. เพิ่มลิงก์ใน `src/components/Sidebar.jsx`

### **แก้ไข Tax Logic**
- แก้ไขใน `src/pages/TaxCalculatorPage.jsx` (function `taxResult`)

### **เพิ่มค่าลดหย่อนใหม่**
1. เพิ่มฟิลด์ใน `DEFAULT_STATE` 
2. แก้ไข `DeductionSection.jsx`
3. อัปเดต database schema และ API

---

## 📝 API Endpoints

### **Authentication**
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/verify` - ตรวจสอบ token

### **Tax Calculation**
- `POST /api/tax/calculate` - บันทึกการคำนวณ
- `GET /api/tax/history` - ดึงประวัติการคำนวณ
- `DELETE /api/tax/history/:id` - ลบประวัติ

### **User Management**
- `GET /api/user/profile` - ดูข้อมูลส่วนตัว
- `PUT /api/user/profile` - แก้ไขข้อมูลส่วนตัว

---

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd server && npm run test

# E2E tests
npm run test:e2e
```

---

## 📈 Features

✅ **ปัจจุบัน**
- คำนวณภาษีตามกฎหมายไทย 2568
- ระบบสมัครสมาชิก/เข้าสู่ระบบ
- บันทึกประวัติการคำนวณ
- UI/UX ที่ใช้งานง่าย
- Responsive design

🚧 **กำลังพัฒนา**
- ระบบแจ้งเตือน tax deadlines
- Export ผลการคำนวณเป็น PDF
- API integration กับ Revenue Department
- Multi-language support

---

## 👥 Contributing

1. Fork repository
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push และสร้าง Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

สำหรับคำถามหรือปัญหา กรุณาติดต่อ:
- Email: support@checkpasi.com
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

---

**Happy Calculating! 🧮✨**
