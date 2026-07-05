-- ============================================================
-- Migration Phase 7: Environment Inspection System
-- ระบบตรวจสภาพแวดล้อมห้อง Server (ห้อง / ตู้ Rack / แอร์ทำความเย็น)
-- ไม่กระทบตารางเดิมใดๆ ทั้งสิ้น — สร้างตารางใหม่ทั้งหมด
-- ============================================================

CREATE TABLE `env_inspection_sessions` (
  `id`               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `room_id`          BIGINT UNSIGNED NOT NULL,
  `inspector_id`     BIGINT UNSIGNED NOT NULL,
  `status`           ENUM('in_progress','completed','canceled') NOT NULL DEFAULT 'in_progress',
  `overall_status`   ENUM('pass','warning','fail') NULL DEFAULT NULL,
  `temperature_c`    DECIMAL(4,1) NULL,
  `humidity_pct`     DECIMAL(4,1) NULL,
  `notes`            TEXT NULL,
  `started_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at`     TIMESTAMP NULL DEFAULT NULL,
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`       TIMESTAMP NULL DEFAULT NULL,
  `created_by`       BIGINT UNSIGNED NULL,
  `updated_by`       BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_env_sessions_rooms`  FOREIGN KEY (`room_id`)      REFERENCES `rooms`  (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_env_sessions_users`  FOREIGN KEY (`inspector_id`) REFERENCES `users`  (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `env_inspection_room_checks` (
  `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id`  BIGINT UNSIGNED NOT NULL,
  `check_key`   VARCHAR(80)  NOT NULL,
  `check_label` VARCHAR(200) NOT NULL,
  `result`      ENUM('pass','fail','na') NOT NULL DEFAULT 'na',
  `remark`      TEXT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_env_room_checks_sessions` FOREIGN KEY (`session_id`) REFERENCES `env_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `uq_env_room_check` (`session_id`, `check_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `env_inspection_rack_checks` (
  `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id`  BIGINT UNSIGNED NOT NULL,
  `rack_id`     BIGINT UNSIGNED NOT NULL,
  `check_key`   VARCHAR(80)  NOT NULL,
  `check_label` VARCHAR(200) NOT NULL,
  `result`      ENUM('pass','fail','na') NOT NULL DEFAULT 'na',
  `remark`      TEXT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_env_rack_checks_sessions` FOREIGN KEY (`session_id`) REFERENCES `env_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_env_rack_checks_racks`    FOREIGN KEY (`rack_id`)    REFERENCES `racks`                   (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY `uq_env_rack_check` (`session_id`, `rack_id`, `check_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `env_inspection_cooling_logs` (
  `id`                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id`        BIGINT UNSIGNED NOT NULL,
  `equipment_name`    VARCHAR(150) NOT NULL,
  `equipment_type`    ENUM('crac','crah','precision_ac','ups','pdu','other') NOT NULL DEFAULT 'crac',
  `status`            ENUM('normal','warning','fail') NOT NULL DEFAULT 'normal',
  `temperature_in_c`  DECIMAL(4,1) NULL,
  `temperature_out_c` DECIMAL(4,1) NULL,
  `remark`            TEXT NULL,
  `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_env_cooling_sessions` FOREIGN KEY (`session_id`) REFERENCES `env_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_env_sessions_room`      ON `env_inspection_sessions`    (`room_id`);
CREATE INDEX `idx_env_sessions_inspector` ON `env_inspection_sessions`    (`inspector_id`);
CREATE INDEX `idx_env_sessions_status`    ON `env_inspection_sessions`    (`status`);
CREATE INDEX `idx_env_sessions_date`      ON `env_inspection_sessions`    (`started_at`);
CREATE INDEX `idx_env_room_checks_sess`   ON `env_inspection_room_checks` (`session_id`);
CREATE INDEX `idx_env_rack_checks_sess`   ON `env_inspection_rack_checks` (`session_id`);
CREATE INDEX `idx_env_rack_checks_rack`   ON `env_inspection_rack_checks` (`rack_id`);
CREATE INDEX `idx_env_cooling_sess`       ON `env_inspection_cooling_logs`(`session_id`);
