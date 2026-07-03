# 🖥️ Server-check

## ระบบตรวจสอบและบริหารจัดการอุปกรณ์ Server ภายในองค์กร

Server-check เป็นระบบบริหารจัดการอุปกรณ์ Server, Virtual Machine, Rack และทรัพย์สินด้าน IT ผ่านเว็บเบราว์เซอร์ เพื่อช่วยให้หน่วยงานสามารถจัดเก็บข้อมูล ตรวจสอบสภาพอุปกรณ์ วางแผนบำรุงรักษา และติดตามประวัติการตรวจสอบได้อย่างเป็นระบบ

---

# คุณสมบัติของระบบ

- 📊 Dashboard แสดงภาพรวมของระบบ
- 🖥️ จัดการข้อมูล Physical Server
- 💻 จัดการข้อมูล Virtual Machine (VM)
- 🗄️ จัดการ Rack
- 📦 จัดการประเภทอุปกรณ์ (Asset Type)
- 📋 จัดการแบบฟอร์มตรวจสอบ (Inspection Template)
- ✅ บันทึกผลการตรวจสอบ
- 👤 จัดการผู้ใช้งาน
- 🔐 จัดการสิทธิ์การใช้งาน (Role & Permission)
- ⚙️ ตั้งค่าระบบ
- 📁 นำเข้าและส่งออกข้อมูล CSV
- 🔍 ค้นหาข้อมูล
- 📱 รองรับการใช้งานผ่านอุปกรณ์หลายขนาด
- 🔒 ระบบ Login และ Session

---

# เทคโนโลยีที่ใช้

| รายการ | เทคโนโลยี |
|---------|------------|
| Backend | Node.js |
| Framework | Express.js 5 |
| Database | MariaDB 11.x |
| Template Engine | EJS |
| UI Framework | Bootstrap 5 |
| Admin Template | AdminLTE 4 |
| Language | JavaScript |

---

# โครงสร้างโปรเจกต์

```
Server-check
│
├── config/
├── controllers/
├── helpers/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
├── views/
├── public/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── uploads/
│
├── app.js
├── package.json
├── package-lock.json
├── schema.sql
├── .env.example
└── README.md
```

---

# วิธีติดตั้ง

## 1. Clone โปรเจกต์

```bash
git clone https://github.com/ongsillyone-png/Server-check.git
```

---

## 2. ติดตั้ง Package

```bash
npm install
```

---

## 3. สร้างไฟล์ .env

Windows

```cmd
copy .env.example .env
```

Linux

```bash
cp .env.example .env
```

จากนั้นแก้ไขค่าภายในไฟล์ `.env`

---

## 4. สร้างฐานข้อมูล

สร้างฐานข้อมูล MariaDB

แล้ว Import ไฟล์

```
schema.sql
```

---

## 5. ตั้งค่าการเชื่อมต่อฐานข้อมูล

ตัวอย่าง

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=server_check
DB_USER=root
DB_PASS=password

SESSION_SECRET=your_secret_key
```

---

## 6. เริ่มต้นใช้งาน

โหมดพัฒนา

```bash
npm run dev
```

หรือ

```bash
node app.js
```

---

# เข้าใช้งานระบบ

เปิดเว็บ

```
http://localhost:3000
```

---

# ความต้องการของระบบ

- Node.js 22 LTS
- MariaDB 11.x
- npm

---

# แผนการพัฒนาในอนาคต

- Dashboard วิเคราะห์ข้อมูล
- ระบบแจ้งเตือน
- QR Code สำหรับอุปกรณ์
- ระบบ PM (Preventive Maintenance)
- Audit Log
- ระบบ Backup / Restore
- ระบบรายงาน
- REST API
- รองรับหลายหน่วยงาน (Multi Organization)

---

# ผู้พัฒนา

ong-napho
website
https://ssdpcu.com

GitHub

https://github.com/ongsillyone-png

---

# หมายเหตุ

โปรเจกต์นี้พัฒนาขึ้นเพื่อศึกษา วิจัย และเป็นตัวอย่างการพัฒนาระบบบริหารจัดการอุปกรณ์ด้าน IT ภายในองค์กร

ระบบยังอยู่ระหว่างการพัฒนา อาจมีการเปลี่ยนแปลงรายละเอียดหรือเพิ่มความสามารถในเวอร์ชันถัดไป



---

⭐ หากโปรเจกต์นี้มีประโยชน์ สามารถกด **Star** บน GitHub เพื่อเป็นกำลังใจให้ผู้พัฒนาได้ครับ
