# API.md — API Reference

Base URL: `http://yourdomain.com`

> **หมายเหตุ**: API ทั้งหมดต้องผ่าน Session Authentication ก่อน (Login แล้ว)

---

## Authentication

### POST /api/auth/login
เข้าสู่ระบบ

**Request Body**:
```json
{ "username": "admin", "password": "admin1234" }
```

**Response 200**:
```json
{ "success": true, "redirect": "/dashboard" }
```

### POST /api/auth/logout
ออกจากระบบ

---

## Notifications

### GET /notifications/api/unread-count
ดูจำนวนการแจ้งเตือนที่ยังไม่อ่าน

**Response**:
```json
{ "unreadCount": 3 }
```

### POST /notifications/api/read/:id
ทำเครื่องหมายว่าอ่านแล้ว (รายการเดียว)

### POST /notifications/api/read-all
ทำเครื่องหมายว่าอ่านแล้วทั้งหมด

---

## Inspections

### GET /inspections/walk
หน้าเดินตรวจ (Web)

### GET /inspections/api/rooms/:sessionId
ดูรายการ Room พร้อมสถานะการตรวจ

### GET /inspections/api/rooms/:sessionId/:roomId/racks
ดูรายการ Rack ในห้องพร้อมสถานะ

### GET /inspections/api/racks/:sessionId/:rackId/servers
ดูรายการ Server ใน Rack พร้อมสถานะ

### POST /inspections/api/sessions/:sessionId/details
บันทึกผลการตรวจ Server

**Request Body**:
```json
{
  "physical_server_id": 1,
  "status": "pass",
  "remark": "ปกติ",
  "results": [{ "item_id": 1, "result": "pass", "remark": "" }]
}
```

### POST /inspections/api/sessions/:sessionId/complete
ปิดรอบการตรวจ

---

## Reports

### GET /reports/api/daily?date=YYYY-MM-DD
รายงานรายวัน (JSON)

### GET /reports/api/monthly?year=YYYY&month=MM
รายงานรายเดือน (JSON)

### GET /reports/daily/export-csv?date=YYYY-MM-DD
Export CSV รายวัน

---

## Settings

### GET /settings/api/all
ดูค่า Setting ทั้งหมด

### POST /settings/api/update
อัปเดตค่า Setting

**Request Body**:
```json
{
  "inspections_per_day": "2",
  "line_client_key": "...",
  "line_secret_key": "...",
  "daily_summary_time": "08:00"
}
```

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `/auth/*` | 20 requests / 15 นาที / IP |
| ทุก endpoint อื่น | 500 requests / 15 นาที / IP |

เมื่อเกิน limit จะได้รับ HTTP `429 Too Many Requests`
