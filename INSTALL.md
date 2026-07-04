# INSTALL.md — คู่มือติดตั้งระบบ Server Check

## ความต้องการของระบบ (Requirements)

| รายการ | เวอร์ชันที่รองรับ |
|---|---|
| Node.js | 18.x LTS หรือสูงกว่า |
| MariaDB | 10.6+ หรือ MySQL 8.0+ |
| Nginx | 1.18+ (Reverse Proxy) |
| OS | Ubuntu 22.04 / Windows Server 2019+ |
| RAM | 1 GB ขึ้นไป (แนะนำ 2 GB) |
| Disk | 10 GB ขึ้นไป |

---

## ขั้นตอนติดตั้งบน Ubuntu 22.04

### 1. อัปเดตระบบ

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. ติดตั้ง Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # ต้องเห็น v18.x.x
```

### 3. ติดตั้ง MariaDB

```bash
sudo apt install -y mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
```

### 4. สร้างฐานข้อมูล

```sql
CREATE DATABASE server_check CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'scuser'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON server_check.* TO 'scuser'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Import Schema

```bash
mysql -u scuser -p server_check < schema.sql
```

### 6. Clone และติดตั้ง

```bash
git clone https://github.com/ongsillyone-png/Server-check.git /var/www/server-check
cd /var/www/server-check
npm install --production
```

### 7. ตั้งค่า Environment

```bash
cp .env.example .env
nano .env
```

แก้ไขค่าให้ตรง:
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=scuser
DB_PASSWORD=StrongPassword123!
DB_NAME=server_check
SESSION_SECRET=your-very-long-random-secret-key-here
```

### 8. ติดตั้ง PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 start app.js --name server-check
pm2 startup
pm2 save
```

### 9. ติดตั้ง Nginx

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/server-check
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/server-check /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ขั้นตอนติดตั้งบน Windows Server

1. ติดตั้ง Node.js 18 LTS จาก https://nodejs.org
2. ติดตั้ง MariaDB จาก https://mariadb.org/download/
3. Clone repository: `git clone https://github.com/ongsillyone-png/Server-check.git`
4. `cd Server-check && npm install`
5. สร้างไฟล์ `.env` จาก `.env.example`
6. Import schema: `mysql -u root -p server_check < schema.sql`
7. รันระบบ: `node app.js` หรือใช้ PM2 สำหรับ production
