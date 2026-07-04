# DEPLOY.md — คู่มือ Deploy ระบบ Server Check (Production)

## Architecture

```
Internet / Mobile Network
        │
        ▼
   [ Nginx 80 ]  ← Reverse Proxy
        │
        ▼
  [ Node.js :3000 ]  ← Express App (PM2)
        │
        ▼
  [ MariaDB :3306 ]  ← Database
```

---

## การ Deploy ครั้งแรก

ดูคู่มือการติดตั้งใน [INSTALL.md](INSTALL.md)

---

## การอัปเดตระบบ (Update Deployment)

```bash
cd /var/www/server-check

# 1. Pull code ใหม่
git pull origin main

# 2. ติดตั้ง package ที่อาจเพิ่มใหม่
npm install --production

# 3. Restart application
pm2 restart server-check

# 4. ตรวจสอบสถานะ
pm2 status
pm2 logs server-check --lines 20
```

---

## PM2 Commands ที่ใช้บ่อย

```bash
pm2 status                    # ดูสถานะ process ทั้งหมด
pm2 logs server-check         # ดู log แบบ realtime
pm2 restart server-check      # restart application
pm2 stop server-check         # หยุด application
pm2 delete server-check       # ลบออกจาก PM2
pm2 monit                     # Monitor CPU/Memory
```

---

## Nginx Configuration Tips

### ตั้งค่า Client Max Body Size (สำหรับ upload รูปภาพ)
```nginx
client_max_body_size 10M;
```

### ตั้งค่า Proxy Timeout
```nginx
proxy_connect_timeout 60s;
proxy_read_timeout 60s;
proxy_send_timeout 60s;
```

### ตั้งค่า Gzip Compression (เร็วขึ้นบนมือถือ)
```nginx
gzip on;
gzip_types text/plain text/css application/javascript application/json;
gzip_min_length 1000;
```

---

## การตรวจสอบหลัง Deploy

```bash
# ตรวจสอบ HTTP Response Headers (ต้องมี X-Frame-Options, X-Content-Type-Options)
curl -I http://yourdomain.com

# ตรวจสอบ Log ล่าสุด
tail -f /var/www/server-check/logs/$(date +%Y-%m-%d)-access.log

# ตรวจสอบ Error Log
tail -f /var/www/server-check/logs/$(date +%Y-%m-%d)-error.log
```

---

## Environment Variables Reference

| Variable | ตัวอย่าง | คำอธิบาย |
|---|---|---|
| `NODE_ENV` | `production` | โหมดการทำงาน |
| `PORT` | `3000` | Port ของ Node.js |
| `DB_HOST` | `localhost` | Host ของ MariaDB |
| `DB_PORT` | `3306` | Port ของ MariaDB |
| `DB_USER` | `scuser` | Database username |
| `DB_PASSWORD` | `...` | Database password |
| `DB_NAME` | `server_check` | Database name |
| `SESSION_SECRET` | `random-string` | Session encryption key (ยาวๆ) |
| `LINE_CLIENT_KEY` | `...` | MOPH Notify Client Key |
| `LINE_SECRET_KEY` | `...` | MOPH Notify Secret Key |

---

## Backup Database

```bash
# สร้าง backup รายวัน
mysqldump -u scuser -p server_check > backup_$(date +%Y%m%d).sql

# Restore จาก backup
mysql -u scuser -p server_check < backup_20260704.sql
```
