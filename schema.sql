CREATE DATABASE IF NOT EXISTS `server_check` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `server_check`;

-- Disable foreign key checks to allow drops and creation
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Drop Tables if they exist
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inspection_photos`;
DROP TABLE IF EXISTS `inspection_results`;
DROP TABLE IF EXISTS `inspection_details`;
DROP TABLE IF EXISTS `inspection_sessions`;
DROP TABLE IF EXISTS `inspection_template_items`;
DROP TABLE IF EXISTS `inspection_templates`;
DROP TABLE IF EXISTS `device_metrics_log`;
DROP TABLE IF EXISTS `device_health_status`;
DROP TABLE IF EXISTS `device_monitoring_configs`;
DROP TABLE IF EXISTS `virtual_machines`;
DROP TABLE IF EXISTS `physical_servers`;
DROP TABLE IF EXISTS `asset_types`;
DROP TABLE IF EXISTS `racks`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `settings`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table `roles`
-- --------------------------------------------------------
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  `role_code` VARCHAR(30) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `rooms`
-- --------------------------------------------------------
CREATE TABLE `rooms` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `room_name` VARCHAR(100) NOT NULL,
  `floor` VARCHAR(20) NOT NULL,
  `building` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `racks`
-- --------------------------------------------------------
CREATE TABLE `racks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `room_id` BIGINT UNSIGNED NOT NULL,
  `rack_name` VARCHAR(50) NOT NULL,
  `unit_size` INT UNSIGNED NOT NULL DEFAULT 42,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_racks_rooms` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `asset_types`
-- --------------------------------------------------------
CREATE TABLE `asset_types` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `type_name` VARCHAR(100) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `physical_servers`
-- --------------------------------------------------------
CREATE TABLE `physical_servers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `rack_id` BIGINT UNSIGNED NOT NULL,
  `asset_type_id` BIGINT UNSIGNED NOT NULL,
  `server_name` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NULL,
  `serial_number` VARCHAR(100) NULL UNIQUE,
  `ip_address` VARCHAR(45) NULL,
  `asset_number` VARCHAR(100) NULL UNIQUE,
  `rack_position_u` INT UNSIGNED NULL,
  `description` TEXT NULL,
  `status` ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_physical_servers_racks` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_physical_servers_asset_types` FOREIGN KEY (`asset_type_id`) REFERENCES `asset_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `virtual_machines`
-- --------------------------------------------------------
CREATE TABLE `virtual_machines` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `physical_server_id` BIGINT UNSIGNED NOT NULL,
  `vm_name` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `os_type` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `status` ENUM('running', 'stopped', 'suspended') NOT NULL DEFAULT 'running',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_virtual_machines_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `device_monitoring_configs`
-- --------------------------------------------------------
CREATE TABLE `device_monitoring_configs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `physical_server_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `is_monitoring_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `monitoring_method` ENUM('ping', 'snmp', 'agent', 'http_api') NOT NULL DEFAULT 'ping',
  `snmp_version` ENUM('v1', 'v2c', 'v3') NULL,
  `snmp_community` VARCHAR(100) NULL,
  `snmp_port` INT UNSIGNED NOT NULL DEFAULT 161,
  `agent_port` INT UNSIGNED NOT NULL DEFAULT 9100,
  `agent_token` VARCHAR(255) NULL,
  `api_endpoint` VARCHAR(255) NULL,
  `check_interval_seconds` INT UNSIGNED NOT NULL DEFAULT 300,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_monitoring_configs_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `device_health_status`
-- --------------------------------------------------------
CREATE TABLE `device_health_status` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `physical_server_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `status` ENUM('up', 'down', 'warning', 'unknown') NOT NULL DEFAULT 'unknown',
  `last_checked_at` TIMESTAMP NULL DEFAULT NULL,
  `response_time_ms` INT UNSIGNED NULL,
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_health_status_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `device_metrics_log`
-- --------------------------------------------------------
CREATE TABLE `device_metrics_log` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `physical_server_id` BIGINT UNSIGNED NOT NULL,
  `cpu_usage_pct` DECIMAL(5, 2) NULL,
  `ram_usage_pct` DECIMAL(5, 2) NULL,
  `temperature_celsius` DECIMAL(5, 2) NULL,
  `network_in_bps` BIGINT UNSIGNED NULL,
  `network_out_bps` BIGINT UNSIGNED NULL,
  `logged_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_metrics_log_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `inspection_templates`
-- --------------------------------------------------------
CREATE TABLE `inspection_templates` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `template_name` VARCHAR(100) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `inspection_template_items`
-- --------------------------------------------------------
CREATE TABLE `inspection_template_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `template_id` BIGINT UNSIGNED NOT NULL,
  `item_name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `item_type` ENUM('boolean', 'numeric', 'text') NOT NULL DEFAULT 'boolean',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  CONSTRAINT `fk_inspection_template_items_templates` FOREIGN KEY (`template_id`) REFERENCES `inspection_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table `inspection_sessions`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table `inspection_details`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table `inspection_results`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table `inspection_photos`
-- --------------------------------------------------------
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

-- --------------------------------------------------------
-- Table `settings`
-- --------------------------------------------------------
CREATE TABLE `settings` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Indexes
-- --------------------------------------------------------
CREATE INDEX `idx_racks_room_id` ON `racks` (`room_id`);
CREATE INDEX `idx_physical_servers_rack_id` ON `physical_servers` (`rack_id`);
CREATE INDEX `idx_physical_servers_asset_type_id` ON `physical_servers` (`asset_type_id`);
CREATE INDEX `idx_vms_physical_server_id` ON `virtual_machines` (`physical_server_id`);
CREATE INDEX `idx_inspection_template_items_template_id` ON `inspection_template_items` (`template_id`);
CREATE INDEX `idx_sessions_status` ON `inspection_sessions` (`status`);
CREATE INDEX `idx_details_session` ON `inspection_details` (`session_id`);
CREATE INDEX `idx_results_detail` ON `inspection_results` (`detail_id`);


-- ========================================================
-- Insert Seed Data (Baseline Test Data)
-- ========================================================

-- Roles
INSERT INTO `roles` (`id`, `role_name`, `role_code`, `description`) VALUES
(1, 'System Administrator', 'ADMIN', 'Full system access and management privileges'),
(2, 'Inspector Technician', 'INSPECTOR', 'Walkthrough inspection rights'),
(3, 'Executive Viewer', 'VIEWER', 'Read-only access to dashboard and reports');

-- Users (SHA256 hashes: admin123, inspector123, viewer123)
INSERT INTO `users` (`id`, `username`, `password_hash`, `role_id`, `name`, `email`, `is_active`) VALUES
(1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 1, 'System Administrator', 'admin@hospital.go.th', 1),
(2, 'inspector1', 'd899f47283d49dce931d95081a21c20051d0f70109fd9ae6d6774601274190da', 2, 'John Doe (Inspector)', 'john.doe@hospital.go.th', 1),
(3, 'viewer1', '65375049b9e4d7cad6c9ba286fdeb9394b28135a3e84136404cfccfdcc438894', 3, 'Jane Smith (Director)', 'jane.smith@hospital.go.th', 1);

-- Settings
INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `description`) VALUES
(1, 'hospital_name', 'โรงพยาบาลศูนย์บริการสุขภาพส่วนกลาง', 'ชื่อของโรงพยาบาลสำหรับแสดงในรายงานและหน้าจอ'),
(2, 'sys_log_retention_days', '90', 'จำนวนวันที่เก็บประวัติการตรวจสอบย้อนหลัง'),
(3, 'maintenance_contact', 'ศูนย์ไอที เบอร์โทร 1122', 'ข้อมูลติดต่อฝ่ายช่างหรือไอทีผู้ดูแลตึกคอมพิวเตอร์');

-- Rooms
INSERT INTO `rooms` (`id`, `room_name`, `floor`, `building`, `description`) VALUES
(1, 'Main Server Room A', '4th Floor', 'IT Building', 'Primary datacenter for hospital core systems'),
(2, 'Backup Server Room B', '2nd Floor', 'Outpatient Department Building', 'Secondary backup and DR site datacenter');

-- Racks
INSERT INTO `racks` (`id`, `room_id`, `rack_name`, `unit_size`, `description`) VALUES
(1, 1, 'Rack A-01', 42, 'Hosts database and application servers'),
(2, 1, 'Rack A-02', 42, 'Hosts network switches and firewalls'),
(3, 2, 'Rack B-01', 42, 'Hosts DR/Backup servers and backup switches');

-- Asset Types
INSERT INTO `asset_types` (`id`, `type_name`, `description`) VALUES
(1, 'Server Host', 'Physical servers and cluster hosts'),
(2, 'Network Switch', 'Core and edge network switches'),
(3, 'Router Gateway', 'Routing and WAN gateways'),
(4, 'Next-Gen Firewall', 'Network firewalls and security gates');

-- Physical Servers (and Network Devices)
INSERT INTO `physical_servers` (`id`, `rack_id`, `asset_type_id`, `server_name`, `model`, `serial_number`, `ip_address`, `asset_number`, `rack_position_u`, `description`, `status`) VALUES
(1, 1, 1, 'HIS-DB-01', 'Dell PowerEdge R750', 'DELL-SN-12345', '10.200.1.10', 'ASSET-IT-0001', 10, 'Primary Hospital Information System Database Server', 'active'),
(2, 1, 1, 'HIS-APP-01', 'Dell PowerEdge R750', 'DELL-SN-67890', '10.200.1.11', 'ASSET-IT-0002', 12, 'Primary Hospital Information System Application Server', 'active'),
(3, 2, 2, 'Core-Switch-01', 'Cisco Catalyst 9300', 'CISCO-SN-9999', '10.200.1.1', 'ASSET-IT-0003', 40, 'Main Core Switch Room A', 'active'),
(4, 2, 4, 'Main-Firewall-01', 'FortiGate 200F', 'FORTI-SN-8888', '10.200.1.254', 'ASSET-IT-0004', 42, 'Primary Hospital Network Edge Firewall', 'active'),
(5, 3, 1, 'DR-Server-01', 'HP ProLiant DL380 Gen10', 'HP-SN-77777', '10.200.2.10', 'ASSET-IT-0005', 15, 'Disaster Recovery and Backup Host Server', 'active');

-- Virtual Machines
INSERT INTO `virtual_machines` (`id`, `physical_server_id`, `vm_name`, `ip_address`, `os_type`, `description`, `status`) VALUES
(1, 1, 'VM-HIS-Database', '10.200.1.20', 'Red Hat Enterprise Linux 8.5', 'Main database instance running Oracle 19c', 'running'),
(2, 1, 'VM-HIS-ReadReplica', '10.200.1.21', 'Red Hat Enterprise Linux 8.5', 'Read-only replica database for analytical reports', 'running'),
(3, 2, 'VM-HIS-IIS-Web01', '10.200.1.30', 'Windows Server 2019', 'Web client frontend server', 'running'),
(4, 2, 'VM-PACS-Server', '10.200.1.35', 'Windows Server 2019', 'Picture Archiving and Communication System Server', 'running'),
(5, 5, 'VM-DR-HIS-Database', '10.200.2.20', 'Red Hat Enterprise Linux 8.5', 'Standby database replication host', 'stopped');

-- Device Monitoring Configs (Pre-prepared structure for monitoring)
INSERT INTO `device_monitoring_configs` (`id`, `physical_server_id`, `is_monitoring_enabled`, `monitoring_method`, `snmp_version`, `snmp_community`, `snmp_port`, `agent_port`, `agent_token`, `api_endpoint`, `check_interval_seconds`) VALUES
(1, 1, 1, 'agent', NULL, NULL, 161, 9100, 'sec-tok-db-01', NULL, 60),
(2, 2, 1, 'agent', NULL, NULL, 161, 9100, 'sec-tok-app-01', NULL, 60),
(3, 3, 1, 'snmp', 'v2c', 'hosp-public-snmp', 161, 9100, NULL, NULL, 300),
(4, 4, 1, 'ping', NULL, NULL, 161, 9100, NULL, NULL, 300),
(5, 5, 0, 'ping', NULL, NULL, 161, 9100, NULL, NULL, 300);

-- Device Health Status (Initial monitoring values)
INSERT INTO `device_health_status` (`id`, `physical_server_id`, `status`, `last_checked_at`, `response_time_ms`, `error_message`) VALUES
(1, 1, 'up', NOW(), 1, NULL),
(2, 2, 'up', NOW(), 2, NULL),
(3, 3, 'up', NOW(), 5, NULL),
(4, 4, 'up', NOW(), 4, NULL),
(5, 5, 'unknown', NULL, NULL, 'Monitoring configuration is disabled for this server');

-- Device Metrics Logs (Time-series logs mock data)
INSERT INTO `device_metrics_log` (`physical_server_id`, `cpu_usage_pct`, `ram_usage_pct`, `temperature_celsius`, `network_in_bps`, `network_out_bps`, `logged_at`) VALUES
(1, 45.20, 78.50, 42.50, 15000000, 45000000, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(1, 48.90, 79.10, 43.00, 18000000, 52000000, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(1, 42.10, 78.40, 42.00, 14000000, 41000000, NOW()),
(2, 22.40, 55.10, 38.00, 25000000, 12000000, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(2, 28.50, 56.40, 39.20, 31000000, 15000000, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(2, 25.10, 55.80, 38.50, 28000000, 13000000, NOW());

-- Inspection Templates
INSERT INTO `inspection_templates` (`id`, `template_name`, `is_active`) VALUES
(1, 'Daily Server Room General Inspection Template V1', 1);

-- Inspection Template Items (Scope V1 Checklist questions)
INSERT INTO `inspection_template_items` (`id`, `template_id`, `item_name`, `description`, `item_type`, `sort_order`, `is_active`) VALUES
(1, 1, 'Power LED Status', 'Check if the primary/redundant power supply green LEDs are glowing normally.', 'boolean', 1, 1),
(2, 1, 'Alarm LED Status', 'Verify that there are no red, amber, or flashing warning lights on the chassis.', 'boolean', 2, 1),
(3, 1, 'Network Cable Connection', 'Check that all Ethernet and fiber connections are securely seated and lights blinking.', 'boolean', 3, 1),
(4, 1, 'Power Cable Connection', 'Check that power cables are firmly plugged into the UPS/PDU and secured with clips.', 'boolean', 4, 1),
(5, 1, 'Dust Accumulation', 'Inspect front grills and exhaust filters for excessive dust blockage.', 'boolean', 5, 1),
(6, 1, 'Fan Sound & Speed', 'Listen for abnormal vibrations, grinding noises, or failure alerts from exhaust fans.', 'boolean', 6, 1),
(7, 1, 'Temperature Celsius', 'Read the digital ambient temp indicator on the rack or measure exhaust flow.', 'numeric', 7, 1),
(8, 1, 'Physical Damage Status', 'Ensure there are no signs of dents, rust, or physical intrusion on the chassis.', 'boolean', 8, 1),
(9, 1, 'Remark', 'Write down any anomalies observed or manual actions taken.', 'text', 9, 1);

-- Inspection Sessions (Walkthrough Transactions)
-- Completed Session 1 (Completed 1 day ago)
INSERT INTO `inspection_sessions` (`id`, `inspector_id`, `status`, `started_at`, `completed_at`, `created_by`, `updated_by`) VALUES
(1, 2, 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR), 2, 2);

-- In-progress Session 2 (Currently ongoing)
INSERT INTO `inspection_sessions` (`id`, `inspector_id`, `status`, `started_at`, `completed_at`, `created_by`, `updated_by`) VALUES
(2, 2, 'in_progress', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 2, 2);

-- Inspection Details (For Completed Session 1 - checking 3 devices)
INSERT INTO `inspection_details` (`id`, `session_id`, `physical_server_id`, `status`, `remark`, `created_by`, `updated_by`) VALUES
(1, 1, 1, 'pass', 'Server database primary check complete. All green.', 2, 2),
(2, 1, 2, 'pass', 'App server working normally.', 2, 2),
(3, 1, 3, 'warning', 'Core switch rack A-02 is reporting warning due to dust buildup on exhaust filter.', 2, 2);

-- Detailed item results for HIS-DB-01 (All passed, Temp 21.5C)
INSERT INTO `inspection_results` (`detail_id`, `template_item_id`, `result_value`, `boolean_value`, `numeric_value`, `text_value`, `remark`, `created_by`, `updated_by`) VALUES
(1, 1, 'pass', 1, NULL, NULL, NULL, 2, 2), -- Power LED
(1, 2, 'pass', 1, NULL, NULL, NULL, 2, 2), -- Alarm LED
(1, 3, 'pass', 1, NULL, NULL, NULL, 2, 2), -- Network
(1, 4, 'pass', 1, NULL, NULL, NULL, 2, 2), -- Power Cable
(1, 5, 'pass', 1, NULL, NULL, NULL, 2, 2), -- Dust
(1, 6, 'pass', 1, NULL, NULL, NULL, 2, 2), -- Fan
(1, 7, 'pass', NULL, 21.50, NULL, NULL, 2, 2), -- Temp
(1, 8, 'pass', 1, NULL, NULL, NULL, 2, 2), -- Damage
(1, 9, 'pass', NULL, NULL, 'Everything looks perfect.', NULL, 2, 2); -- Remark Text

-- Detailed item results for HIS-APP-01 (All passed, Temp 22.0C)
INSERT INTO `inspection_results` (`detail_id`, `template_item_id`, `result_value`, `boolean_value`, `numeric_value`, `text_value`, `remark`, `created_by`, `updated_by`) VALUES
(2, 1, 'pass', 1, NULL, NULL, NULL, 2, 2),
(2, 2, 'pass', 1, NULL, NULL, NULL, 2, 2),
(2, 3, 'pass', 1, NULL, NULL, NULL, 2, 2),
(2, 4, 'pass', 1, NULL, NULL, NULL, 2, 2),
(2, 5, 'pass', 1, NULL, NULL, NULL, 2, 2),
(2, 6, 'pass', 1, NULL, NULL, NULL, 2, 2),
(2, 7, 'pass', NULL, 22.00, NULL, NULL, 2, 2),
(2, 8, 'pass', 1, NULL, NULL, NULL, 2, 2),
(2, 9, 'pass', NULL, NULL, 'IIS Application server checking completed.', NULL, 2, 2);

-- Detailed item results for Core-Switch-01 (Warning on Dust, Temp 24.5C)
INSERT INTO `inspection_results` (`detail_id`, `template_item_id`, `result_value`, `boolean_value`, `numeric_value`, `text_value`, `remark`, `created_by`, `updated_by`) VALUES
(3, 1, 'pass', 1, NULL, NULL, NULL, 2, 2),
(3, 2, 'pass', 1, NULL, NULL, NULL, 2, 2),
(3, 3, 'pass', 1, NULL, NULL, NULL, 2, 2),
(3, 4, 'pass', 1, NULL, NULL, NULL, 2, 2),
(3, 5, 'fail', 0, NULL, 'Dust accumulation is visible on rear fan intake filter.', NULL, 2, 2),
(3, 6, 'pass', 1, NULL, NULL, NULL, 2, 2),
(3, 7, 'pass', NULL, 24.50, NULL, NULL, 2, 2),
(3, 8, 'pass', 1, NULL, NULL, NULL, 2, 2),
(3, 9, 'pass', NULL, NULL, 'Filter needs cleaning at next maintenance window.', NULL, 2, 2);

-- Photos attached to checks (Example: attachment for dirty dust filter on Core-Switch-01)
INSERT INTO `inspection_photos` (`id`, `detail_id`, `result_id`, `photo_path`, `created_by`, `updated_by`) VALUES
(1, 3, NULL, '/uploads/inspections/1/core-switch-dust.jpg', 2, 2);
