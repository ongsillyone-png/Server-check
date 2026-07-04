# DATABASE.md — โครงสร้างฐานข้อมูล Server Check

Database: `server_check` | Charset: `utf8mb4_unicode_ci` | Engine: `InnoDB`

---

## ตารางทั้งหมด

| ตาราง | คำอธิบาย |
|---|---|
| `users` | ผู้ใช้งานระบบ |
| `roles` | บทบาท/สิทธิ์การใช้งาน |
| `rooms` | ห้องเซิร์ฟเวอร์ |
| `racks` | ตู้แร็คภายในห้อง |
| `asset_types` | ประเภทอุปกรณ์ |
| `physical_servers` | เครื่อง Server จริง |
| `virtual_machines` | เครื่อง VM (Virtual Machine) |
| `device_monitoring_configs` | การตั้งค่า Monitoring ต่ออุปกรณ์ |
| `inspection_templates` | แม่แบบ Checklist |
| `inspection_template_items` | หัวข้อย่อยใน Checklist |
| `inspection_sessions` | รอบการเดินตรวจ |
| `inspection_details` | รายการตรวจต่ออุปกรณ์ |
| `inspection_results` | ผลตรวจในแต่ละหัวข้อ |
| `inspection_photos` | รูปถ่ายการตรวจ |
| `notifications` | การแจ้งเตือนในระบบ |
| `settings` | ค่าการตั้งค่าระบบ (key-value) |

---

## กฎการออกแบบ

- ทุกตารางมี: `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`
- `deleted_at IS NULL` = Soft Delete (ยังไม่ลบจริง)
- Foreign Key ทุกตัวมี Index
- ข้อมูลจำนวนมาก (inspections) มี Composite Index สำหรับ Query ที่ใช้บ่อย

---

## ความสัมพันธ์หลัก

```
rooms (1) ──── (*) racks
racks (1) ──── (*) physical_servers
physical_servers (1) ──── (*) virtual_machines
physical_servers (1) ──── (1) device_monitoring_configs

inspection_templates (1) ──── (*) inspection_template_items
inspection_sessions (1) ──── (*) inspection_details
inspection_details (1) ──── (*) inspection_results
inspection_details (1) ──── (*) inspection_photos
inspection_details (*) ──── (1) physical_servers
```

---

## settings table (Key-Value Store)

| Key | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|
| `inspections_per_day` | `1` | จำนวนรอบตรวจต่อวัน |
| `line_client_key` | `''` | MOPH Notify Client Key |
| `line_secret_key` | `''` | MOPH Notify Secret Key |
| `daily_summary_time` | `08:00` | เวลาส่งสรุปประจำวัน |

---

## Migration Scripts

| ไฟล์ | เนื้อหา |
|---|---|
| `schema.sql` | Schema เต็ม พร้อม Seed Data |
| `migration-phase2.sql` | Indexes และ FK เพิ่มเติม Phase 2 |
| `migration-phase5.sql` | ตาราง notifications และ settings Phase 5 |
