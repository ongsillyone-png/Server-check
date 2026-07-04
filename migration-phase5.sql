-- Disable foreign keys check
SET FOREIGN_KEY_CHECKS = 0;

-- Drop table if exists
DROP TABLE IF EXISTS `notifications`;

-- Create notifications table
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('uninspected_room', 'uninspected_rack', 'uninspected_server', 'inspection_fail', 'daily_summary') NOT NULL DEFAULT 'daily_summary',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Indexes for notifications
CREATE INDEX `idx_notifications_is_read` ON `notifications` (`is_read`);

-- Seed default notification settings keys if not already present
INSERT INTO `settings` (`setting_key`, `setting_value`, `description`) 
VALUES 
('line_client_key', 'da327a4cc88a61c699bee53a115eae7506a4af9b', 'MOPH Line Notify Client Key')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `settings` (`setting_key`, `setting_value`, `description`) 
VALUES 
('line_secret_key', 'P5NBQRIY4HE2QIVRRSAMAZWEVVKY', 'MOPH Line Notify Secret Key')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `settings` (`setting_key`, `setting_value`, `description`) 
VALUES 
('notification_time', '18:00', 'เวลาส่งการแจ้งเตือนสรุปประจำวัน (รูปแบบ HH:MM)')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT INTO `settings` (`setting_key`, `setting_value`, `description`) 
VALUES 
('is_notification_enabled', '1', 'เปิด/ปิด การแจ้งเตือนทางไลน์ (1 = เปิด, 0 = ปิด)')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);
