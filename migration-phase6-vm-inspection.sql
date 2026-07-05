-- ============================================================
-- Migration Phase 6: VM Inspection System
-- เพิ่มระบบตรวจ VM แยกจาก Physical Server Inspection
-- ไม่กระทบตาราง inspection_sessions/details/results เดิม
-- ============================================================

-- 1. เพิ่ม target_type ใน inspection_templates
ALTER TABLE `inspection_templates`
  ADD COLUMN `target_type` ENUM('physical_server', 'vm') NOT NULL DEFAULT 'physical_server'
  AFTER `template_name`;

-- อัปเดต template เดิม (id=1) ให้ชัดเจนว่าเป็น physical_server
UPDATE `inspection_templates` SET `target_type` = 'physical_server' WHERE `id` = 1;

-- 2. เพิ่ม VM Inspection Template (template สำหรับ VM โดยเฉพาะ)
INSERT INTO `inspection_templates` (`id`, `template_name`, `target_type`, `is_active`) VALUES
(2, 'แบบฟอร์มตรวจสอบ Virtual Machine รายวัน V1', 'vm', 1);

-- 3. เพิ่ม VM Checklist Items
INSERT INTO `inspection_template_items` (`template_id`, `item_name`, `description`, `item_type`, `sort_order`, `is_active`) VALUES
(2, 'สถานะการทำงานของ VM (Power State)', 'ตรวจสอบว่า VM อยู่ในสถานะ Running ปกติ ไม่ใช่ Stopped หรือ Suspended', 'boolean', 1, 1),
(2, 'การใช้งาน CPU (<80%)', 'ตรวจสอบว่า CPU utilization ไม่เกิน 80% เฉลี่ย 15 นาทีที่ผ่านมา', 'boolean', 2, 1),
(2, 'การใช้งาน RAM (<85%)', 'ตรวจสอบว่า RAM utilization ไม่เกิน 85% ของ Memory ที่จัดสรรให้', 'boolean', 3, 1),
(2, 'พื้นที่ดิสก์เพียงพอ (>10% ว่าง)', 'ตรวจสอบว่ามีพื้นที่ดิสก์ว่างเหลืออย่างน้อย 10% บน Volume หลัก', 'boolean', 4, 1),
(2, 'การเชื่อมต่อเครือข่าย (Network Ping)', 'Ping ไปยัง IP ของ VM และตรวจสอบว่าตอบสนองภายใน 10ms', 'boolean', 5, 1),
(2, 'ระยะเวลาทำงานต่อเนื่อง (Uptime วัน)', 'บันทึกจำนวนวันที่ VM ทำงานต่อเนื่องโดยไม่ Reboot', 'numeric', 6, 1),
(2, 'สถานะ Backup ล่าสุด', 'ตรวจสอบว่า Backup ล่าสุดสำเร็จและไม่เกิน 24 ชั่วโมงที่ผ่านมา', 'boolean', 7, 1),
(2, 'สถานะ Security Patch / OS Update', 'ตรวจสอบว่า OS ได้รับ Security Patch ล่าสุดและไม่มี Critical Update ค้างอยู่', 'boolean', 8, 1),
(2, 'สถานะ Application Service', 'ตรวจสอบว่า Service หลักที่รันบน VM นี้ทำงานปกติ (เช่น IIS, Apache, Oracle, etc.)', 'boolean', 9, 1),
(2, 'หมายเหตุ', 'บันทึกความผิดปกติหรือการดำเนินการที่ได้ทำไป', 'text', 10, 1);

-- 4. สร้างตาราง vm_inspection_sessions (แยกอิสระ)
CREATE TABLE `vm_inspection_sessions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `inspector_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('in_progress', 'completed', 'canceled') NOT NULL DEFAULT 'in_progress',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_vm_sessions_users` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. สร้างตาราง vm_inspection_details (ผลรายเครื่อง VM)
CREATE TABLE `vm_inspection_details` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `vm_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('pass', 'warning', 'fail') NOT NULL DEFAULT 'pass',
  `remark` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_vm_details_sessions` FOREIGN KEY (`session_id`) REFERENCES `vm_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vm_details_vms` FOREIGN KEY (`vm_id`) REFERENCES `virtual_machines` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. สร้างตาราง vm_inspection_results (ผลรายข้อ)
CREATE TABLE `vm_inspection_results` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `detail_id` BIGINT UNSIGNED NOT NULL,
  `template_item_id` BIGINT UNSIGNED NOT NULL,
  `result_value` ENUM('pass', 'fail', 'na') NOT NULL DEFAULT 'pass',
  `boolean_value` TINYINT(1) NULL,
  `numeric_value` DECIMAL(10,2) NULL,
  `text_value` TEXT NULL,
  `remark` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_vm_results_details` FOREIGN KEY (`detail_id`) REFERENCES `vm_inspection_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vm_results_template_items` FOREIGN KEY (`template_item_id`) REFERENCES `inspection_template_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. สร้าง indexes สำหรับ performance
CREATE INDEX `idx_vm_sessions_status` ON `vm_inspection_sessions` (`status`);
CREATE INDEX `idx_vm_sessions_inspector` ON `vm_inspection_sessions` (`inspector_id`);
CREATE INDEX `idx_vm_details_session` ON `vm_inspection_details` (`session_id`);
CREATE INDEX `idx_vm_details_vm_id` ON `vm_inspection_details` (`vm_id`);
CREATE INDEX `idx_vm_results_detail` ON `vm_inspection_results` (`detail_id`);
CREATE INDEX `idx_inspection_templates_target_type` ON `inspection_templates` (`target_type`);
