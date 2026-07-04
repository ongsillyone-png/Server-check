# CHANGELOG

ประวัติการพัฒนาระบบ Server Check System

---

## [1.0.0] - 2026-07

### Phase 10 — Production Ready
- เพิ่ม `helmet` middleware ป้องกัน XSS, Clickjacking, MIME-sniffing
- เพิ่ม `express-rate-limit` ป้องกัน Brute-force (Global + Login-specific)
- เพิ่ม `trust proxy` สำหรับ Nginx Reverse Proxy
- เพิ่ม Input Sanitizer middleware (trim + null-byte strip)
- เพิ่ม Server-side Validation middleware
- เพิ่ม File Logger (`logs/YYYY-MM-DD-access.log`, `logs/YYYY-MM-DD-error.log`)
- ปรับปรุงหน้า Error 403 / 404 / 500 ให้สวยงาม
- สร้างเอกสารครบชุด (README, CHANGELOG, INSTALL, DEPLOY, DATABASE, API, WALKTHROUGH)

### Phase 8 — Mobile Responsive
- เพิ่ม Sidebar Offcanvas สำหรับมือถือ
- เพิ่ม Overlay backdrop และ toggle animation
- Touch-friendly button sizes (min-height 44px)
- Responsive layout: Mobile / Tablet / Desktop
- Print CSS: ซ่อน Sidebar, Navbar ตอนพิมพ์

### Phase 5 — Notification & Scheduler
- แจ้งเตือนทาง LINE ผ่าน MOPH Notify API
- หน้าตั้งค่า Client Key / Secret Key / เวลาแจ้งเตือน
- Node-cron สรุปการตรวจประจำวันตามเวลาที่กำหนด
- Notification Center: รายการแจ้งเตือน อ่าน/ยังไม่อ่าน
- Bell icon พร้อม badge ใน Navbar (polling 30 วินาที)

### Phase 6 — Reports
- รายงานรายวัน รายเดือน รายปี
- Server Summary / Rack Summary / Room Summary / User Summary
- Export CSV, Print PDF

### Phase 7 — Analytics & KPI
- แดชบอร์ดผู้บริหาร
- KPI รายเดือน รายไตรมาส รายปี
- Top Server/Rack/Room Fail, Top Inspector, Completion Rate
- Apache ECharts: Bar, Line, Pie charts

### Phase 4 — Inspection History
- ค้นหาประวัติย้อนหลังด้วย วันที่ / ห้อง / Rack / Server / ผู้ตรวจ
- รายละเอียดผลตรวจ: Checklist, Result, Timeline
- Export CSV, Pagination

### Phase 3 — Dashboard
- Dashboard Card: Room, Rack, Server, VM, Inspection counts
- กราฟ 30 วัน / 12 เดือน (Apache ECharts)
- Top Room, Rack, Server
- Pie chart: Pass / Fail / N/A

---

ทุก Phase ยึดกฎ:
- Repository Pattern (SQL อยู่ Repository เท่านั้น)
- Service Layer (Business Logic อยู่ Service เท่านั้น)
- Bootstrap 5 + Apache ECharts
- Soft Delete (deleted_at) ทุก Table
- Index ทุก Foreign Key และ Query ที่ใช้บ่อย
