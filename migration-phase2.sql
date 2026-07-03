-- Disable foreign key checks temporarily to drop and recreate tables safely
SET FOREIGN_KEY_CHECKS = 0;

-- Drop old inspection tables to recreate normalized structure
DROP TABLE IF EXISTS `inspection_photos`;
DROP TABLE IF EXISTS `inspection_item_details`;
DROP TABLE IF EXISTS `inspection_results`;
DROP TABLE IF EXISTS `inspections`;

-- Create inspection_sessions
CREATE TABLE `inspection_sessions` (
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
  CONSTRAINT `fk_sessions_users` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create inspection_details
CREATE TABLE `inspection_details` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `physical_server_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('pass', 'warning', 'fail') NOT NULL DEFAULT 'pass',
  `remark` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_details_sessions` FOREIGN KEY (`session_id`) REFERENCES `inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_details_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create inspection_results
CREATE TABLE `inspection_results` (
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
  CONSTRAINT `fk_results_details` FOREIGN KEY (`detail_id`) REFERENCES `inspection_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_results_template_items` FOREIGN KEY (`template_item_id`) REFERENCES `inspection_template_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create inspection_photos
CREATE TABLE `inspection_photos` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `detail_id` BIGINT UNSIGNED NOT NULL,
  `result_id` BIGINT UNSIGNED NULL,
  `photo_path` VARCHAR(512) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_photos_details` FOREIGN KEY (`detail_id`) REFERENCES `inspection_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_photos_results` FOREIGN KEY (`result_id`) REFERENCES `inspection_results` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Indexes for performance optimization
CREATE INDEX `idx_sessions_status` ON `inspection_sessions` (`status`);
CREATE INDEX `idx_details_session` ON `inspection_details` (`session_id`);
CREATE INDEX `idx_results_detail` ON `inspection_results` (`detail_id`);
