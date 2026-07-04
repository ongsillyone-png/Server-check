# Server Check System

ระบบบันทึกผลการเดินตรวจเช็คห้องเครื่องคอมพิวเตอร์ สำหรับโรงพยาบาล
พัฒนาด้วย Node.js + Express + MariaDB + Bootstrap 5

---

## ภาพรวม (Overview)

Server Check System เป็นระบบ Web Application สำหรับบันทึก ติดตาม และรายงานผลการตรวจเช็คเครื่องแม่ข่าย (Physical Server) ประจำวันในห้อง Data Center ของโรงพยาบาล รองรับการเดินตรวจจากมือถือผ่านเบราว์เซอร์ได้โดยตรง

---

## Features

| หมวด | รายละเอียด |
|---|---|
| 🔐 Authentication | Login / Logout / Session / Role-based Access |
| 🏠 Dashboard | สรุปจำนวน Server, Rack, Room, VM พร้อมกราฟ Apache ECharts |
| 🚶 Walkthrough Inspection | เดินตรวจตามรอบ Room → Rack → Server → Checklist |
| 📋 Inspection History | ประวัติย้อนหลัง ค้นหา กรอง Export |
| 📊 Reports | รายงานรายวัน รายเดือน รายปี สรุปตาม Server/Rack/Room |
| 📈 Analytics KPI | แดชบอร์ดผู้บริหาร, KPI รายเดือน/ไตรมาส/ปี |
| 🔔 Notifications | แจ้งเตือนทาง LINE (MOPH Notify), Notification Center |
| ⏰ Scheduler | Node-cron สรุปการตรวจประจำวัน |
| 📱 Responsive | รองรับ Desktop, Tablet, Mobile (Sidebar Offcanvas) |
| 🛡️ Security | Helmet, Rate Limiting, Input Sanitization |

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Template Engine**: EJS
- **Database**: MariaDB 10.6+
- **CSS Framework**: Bootstrap 5.3
- **Charts**: Apache ECharts
- **Icons**: Bootstrap Icons
- **Scheduler**: node-cron
- **Security**: helmet, express-rate-limit

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/ongsillyone-png/Server-check.git
cd Server-check

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# แก้ไขค่า DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SESSION_SECRET

# 4. Import database schema
mysql -u root -p < schema.sql

# 5. Start development server
npm run dev
```

เปิด browser ไปที่ `http://localhost:3000`

---

## Default Credentials

| Username | Password | Role |
|---|---|---|
| admin | admin1234 | admin |

> ⚠️ **เปลี่ยนรหัสผ่านทันทีหลัง Deploy จริง**

---

## Directory Structure

```
Server-check/
├── app.js                # Express app entrypoint
├── config/               # Database, session, scheduler, logger
├── controllers/          # Business logic routing layer
├── helpers/              # Utility functions (date format etc.)
├── middlewares/          # Auth, error, security, validation
├── models/               # (Reserved)
├── public/               # Static assets (CSS, JS, images)
├── repositories/         # SQL query layer (Repository pattern)
├── routes/               # Express route definitions
├── services/             # Business logic services
├── views/                # EJS templates
│   ├── layouts/          # Header, Sidebar, Footer partials
│   ├── errors/           # 403, 404, 500 error pages
│   └── ...               # Feature-specific views
├── logs/                 # Access & error logs (gitignored)
├── schema.sql            # Full database schema
└── .env.example          # Environment variable template
```

---

## License

ISC © 2026 Hospital IT Department
