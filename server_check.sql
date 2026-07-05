/*
 Navicat Premium Dump SQL

 Source Server         : 127.0.0.1
 Source Server Type    : MariaDB
 Source Server Version : 110412 (11.4.12-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : server_check

 Target Server Type    : MariaDB
 Target Server Version : 110412 (11.4.12-MariaDB)
 File Encoding         : 65001

 Date: 05/07/2026 21:17:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for asset_types
-- ----------------------------
DROP TABLE IF EXISTS `asset_types`;
CREATE TABLE `asset_types`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `type_name`(`type_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of asset_types
-- ----------------------------
INSERT INTO `asset_types` VALUES (1, 'Server Host', 'Physical servers and cluster hosts', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `asset_types` VALUES (2, 'Network Switch', 'Core and edge network switches', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `asset_types` VALUES (3, 'Router Gateway', 'Routing and WAN gateways', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `asset_types` VALUES (4, 'Next-Gen Firewall', 'Network firewalls and security gates', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for device_health_status
-- ----------------------------
DROP TABLE IF EXISTS `device_health_status`;
CREATE TABLE `device_health_status`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `physical_server_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('up','down','warning','unknown') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unknown',
  `last_checked_at` timestamp NULL DEFAULT NULL,
  `response_time_ms` int(10) UNSIGNED NULL DEFAULT NULL,
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `physical_server_id`(`physical_server_id` ASC) USING BTREE,
  CONSTRAINT `fk_health_status_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of device_health_status
-- ----------------------------
INSERT INTO `device_health_status` VALUES (1, 1, 'up', '2026-07-04 03:23:27', 1, NULL, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_health_status` VALUES (2, 2, 'up', '2026-07-04 03:23:27', 2, NULL, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_health_status` VALUES (3, 3, 'up', '2026-07-04 03:23:27', 5, NULL, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_health_status` VALUES (4, 4, 'up', '2026-07-04 03:23:27', 4, NULL, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_health_status` VALUES (5, 5, 'unknown', NULL, NULL, 'Monitoring configuration is disabled for this server', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for device_metrics_log
-- ----------------------------
DROP TABLE IF EXISTS `device_metrics_log`;
CREATE TABLE `device_metrics_log`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `physical_server_id` bigint(20) UNSIGNED NOT NULL,
  `cpu_usage_pct` decimal(5, 2) NULL DEFAULT NULL,
  `ram_usage_pct` decimal(5, 2) NULL DEFAULT NULL,
  `temperature_celsius` decimal(5, 2) NULL DEFAULT NULL,
  `network_in_bps` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `network_out_bps` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `logged_at` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_metrics_log_physical_servers`(`physical_server_id` ASC) USING BTREE,
  CONSTRAINT `fk_metrics_log_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of device_metrics_log
-- ----------------------------
INSERT INTO `device_metrics_log` VALUES (1, 1, 45.20, 78.50, 42.50, 15000000, 45000000, '2026-07-04 03:13:27', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_metrics_log` VALUES (2, 1, 48.90, 79.10, 43.00, 18000000, 52000000, '2026-07-04 03:18:27', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_metrics_log` VALUES (3, 1, 42.10, 78.40, 42.00, 14000000, 41000000, '2026-07-04 03:23:27', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_metrics_log` VALUES (4, 2, 22.40, 55.10, 38.00, 25000000, 12000000, '2026-07-04 03:13:27', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_metrics_log` VALUES (5, 2, 28.50, 56.40, 39.20, 31000000, 15000000, '2026-07-04 03:18:27', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_metrics_log` VALUES (6, 2, 25.10, 55.80, 38.50, 28000000, 13000000, '2026-07-04 03:23:27', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for device_monitoring_configs
-- ----------------------------
DROP TABLE IF EXISTS `device_monitoring_configs`;
CREATE TABLE `device_monitoring_configs`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `physical_server_id` bigint(20) UNSIGNED NOT NULL,
  `is_monitoring_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `monitoring_method` enum('ping','snmp','agent','http_api') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ping',
  `snmp_version` enum('v1','v2c','v3') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `snmp_community` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `snmp_port` int(10) UNSIGNED NOT NULL DEFAULT 161,
  `agent_port` int(10) UNSIGNED NOT NULL DEFAULT 9100,
  `agent_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `api_endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `check_interval_seconds` int(10) UNSIGNED NOT NULL DEFAULT 300,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `physical_server_id`(`physical_server_id` ASC) USING BTREE,
  CONSTRAINT `fk_monitoring_configs_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of device_monitoring_configs
-- ----------------------------
INSERT INTO `device_monitoring_configs` VALUES (1, 1, 1, 'agent', NULL, NULL, 161, 9100, 'sec-tok-db-01', NULL, 60, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_monitoring_configs` VALUES (2, 2, 1, 'agent', NULL, NULL, 161, 9100, 'sec-tok-app-01', NULL, 60, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_monitoring_configs` VALUES (3, 3, 1, 'snmp', 'v2c', 'hosp-public-snmp', 161, 9100, NULL, NULL, 300, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_monitoring_configs` VALUES (4, 4, 1, 'ping', NULL, NULL, 161, 9100, NULL, NULL, 300, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `device_monitoring_configs` VALUES (5, 5, 0, 'ping', NULL, NULL, 161, 9100, NULL, NULL, 300, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for env_inspection_cooling_logs
-- ----------------------------
DROP TABLE IF EXISTS `env_inspection_cooling_logs`;
CREATE TABLE `env_inspection_cooling_logs`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `equipment_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `equipment_type` enum('crac','crah','precision_ac','ups','pdu','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'crac',
  `status` enum('normal','warning','fail') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `temperature_in_c` decimal(4, 1) NULL DEFAULT NULL,
  `temperature_out_c` decimal(4, 1) NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_env_cooling_sess`(`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_env_cooling_sessions` FOREIGN KEY (`session_id`) REFERENCES `env_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of env_inspection_cooling_logs
-- ----------------------------
INSERT INTO `env_inspection_cooling_logs` VALUES (1, 1, 'UPS', 'ups', 'normal', NULL, NULL, NULL, '2026-07-05 20:34:11', '2026-07-05 20:34:11');

-- ----------------------------
-- Table structure for env_inspection_rack_checks
-- ----------------------------
DROP TABLE IF EXISTS `env_inspection_rack_checks`;
CREATE TABLE `env_inspection_rack_checks`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `rack_id` bigint(20) UNSIGNED NOT NULL,
  `check_key` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_label` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` enum('pass','fail','na') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'na',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_env_rack_check`(`session_id` ASC, `rack_id` ASC, `check_key` ASC) USING BTREE,
  INDEX `idx_env_rack_checks_sess`(`session_id` ASC) USING BTREE,
  INDEX `idx_env_rack_checks_rack`(`rack_id` ASC) USING BTREE,
  CONSTRAINT `fk_env_rack_checks_racks` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_env_rack_checks_sessions` FOREIGN KEY (`session_id`) REFERENCES `env_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of env_inspection_rack_checks
-- ----------------------------
INSERT INTO `env_inspection_rack_checks` VALUES (1, 1, 3, 'door_closed', 'ประตูตู้ Rack ปิดสนิท', 'na', NULL, '2026-07-05 20:33:34', '2026-07-05 20:33:34');
INSERT INTO `env_inspection_rack_checks` VALUES (2, 1, 3, 'cable_management', 'Cable Management เป็นระเบียบ ไม่กีดขวางอากาศ', 'na', NULL, '2026-07-05 20:33:34', '2026-07-05 20:33:34');
INSERT INTO `env_inspection_rack_checks` VALUES (3, 1, 3, 'blank_panels', 'Blank Panel ติดตั้งครบในช่องว่าง', 'na', NULL, '2026-07-05 20:33:34', '2026-07-05 20:33:34');
INSERT INTO `env_inspection_rack_checks` VALUES (4, 1, 3, 'no_error_led', 'ไม่มี Error LED / Alarm light บนอุปกรณ์', 'na', NULL, '2026-07-05 20:33:34', '2026-07-05 20:33:34');
INSERT INTO `env_inspection_rack_checks` VALUES (5, 1, 3, 'fan_working', 'พัดลมระบายอากาศตู้ทำงานปกติ ไม่มีเสียงผิดปกติ', 'na', NULL, '2026-07-05 20:33:34', '2026-07-05 20:33:34');
INSERT INTO `env_inspection_rack_checks` VALUES (6, 1, 3, 'mounting_secure', 'อุปกรณ์ยึดติดแน่นหนา ไม่มีการเลื่อนหลุด', 'na', NULL, '2026-07-05 20:33:34', '2026-07-05 20:33:34');

-- ----------------------------
-- Table structure for env_inspection_room_checks
-- ----------------------------
DROP TABLE IF EXISTS `env_inspection_room_checks`;
CREATE TABLE `env_inspection_room_checks`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `check_key` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_label` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` enum('pass','fail','na') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'na',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_env_room_check`(`session_id` ASC, `check_key` ASC) USING BTREE,
  INDEX `idx_env_room_checks_sess`(`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_env_room_checks_sessions` FOREIGN KEY (`session_id`) REFERENCES `env_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of env_inspection_room_checks
-- ----------------------------

-- ----------------------------
-- Table structure for env_inspection_sessions
-- ----------------------------
DROP TABLE IF EXISTS `env_inspection_sessions`;
CREATE TABLE `env_inspection_sessions`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `inspector_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('in_progress','completed','canceled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_progress',
  `overall_status` enum('pass','warning','fail') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `temperature_c` decimal(4, 1) NULL DEFAULT NULL,
  `humidity_pct` decimal(4, 1) NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_env_sessions_room`(`room_id` ASC) USING BTREE,
  INDEX `idx_env_sessions_inspector`(`inspector_id` ASC) USING BTREE,
  INDEX `idx_env_sessions_status`(`status` ASC) USING BTREE,
  INDEX `idx_env_sessions_date`(`started_at` ASC) USING BTREE,
  CONSTRAINT `fk_env_sessions_rooms` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_env_sessions_users` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of env_inspection_sessions
-- ----------------------------
INSERT INTO `env_inspection_sessions` VALUES (1, 2, 1, 'canceled', NULL, NULL, NULL, NULL, '2026-07-05 20:31:18', '2026-07-05 20:41:25', '2026-07-05 20:31:18', '2026-07-05 20:41:25', NULL, 1, 1);
INSERT INTO `env_inspection_sessions` VALUES (2, 1, 1, 'in_progress', NULL, NULL, NULL, NULL, '2026-07-05 20:41:31', NULL, '2026-07-05 20:41:31', '2026-07-05 20:41:31', NULL, 1, 1);

-- ----------------------------
-- Table structure for inspection_details
-- ----------------------------
DROP TABLE IF EXISTS `inspection_details`;
CREATE TABLE `inspection_details`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `physical_server_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pass','warning','fail') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pass',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_details_servers`(`physical_server_id` ASC) USING BTREE,
  INDEX `idx_details_session`(`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_details_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_details_sessions` FOREIGN KEY (`session_id`) REFERENCES `inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_details
-- ----------------------------
INSERT INTO `inspection_details` VALUES (1, 1, 5, 'pass', '', '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (2, 1, 2, 'pass', '', '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (3, 1, 1, 'pass', '', '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (4, 2, 5, 'pass', '', '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (5, 2, 2, 'pass', '', '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (6, 2, 1, 'pass', '', '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (7, 2, 4, 'pass', '', '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (8, 2, 3, 'pass', '', '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (9, 1, 4, 'pass', '', '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (10, 1, 3, 'pass', '', '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (11, 3, 2, 'pass', '', '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_details` VALUES (12, 3, 1, 'pass', '', '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);

-- ----------------------------
-- Table structure for inspection_items
-- ----------------------------
DROP TABLE IF EXISTS `inspection_items`;
CREATE TABLE `inspection_items`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `item_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `item_type` enum('boolean','numeric','text') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'boolean',
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_inspection_items_template_id`(`template_id` ASC) USING BTREE,
  CONSTRAINT `fk_inspection_items_templates` FOREIGN KEY (`template_id`) REFERENCES `inspection_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_items
-- ----------------------------
INSERT INTO `inspection_items` VALUES (1, 1, 'Power LED Status', 'Check if the primary/redundant power supply green LEDs are glowing normally.', 'boolean', 1, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (2, 1, 'Alarm LED Status', 'Verify that there are no red, amber, or flashing warning lights on the chassis.', 'boolean', 2, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (3, 1, 'Network Cable Connection', 'Check that all Ethernet and fiber connections are securely seated and lights blinking.', 'boolean', 3, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (4, 1, 'Power Cable Connection', 'Check that power cables are firmly plugged into the UPS/PDU and secured with clips.', 'boolean', 4, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (5, 1, 'Dust Accumulation', 'Inspect front grills and exhaust filters for excessive dust blockage.', 'boolean', 5, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (6, 1, 'Fan Sound & Speed', 'Listen for abnormal vibrations, grinding noises, or failure alerts from exhaust fans.', 'boolean', 6, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (7, 1, 'Temperature Celsius', 'Read the digital ambient temp indicator on the rack or measure exhaust flow.', 'numeric', 7, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (8, 1, 'Physical Damage Status', 'Ensure there are no signs of dents, rust, or physical intrusion on the chassis.', 'boolean', 8, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');
INSERT INTO `inspection_items` VALUES (9, 1, 'Remark', 'Write down any anomalies observed or manual actions taken.', 'text', 9, 1, '2026-07-03 22:03:09', '2026-07-03 22:03:09');

-- ----------------------------
-- Table structure for inspection_photos
-- ----------------------------
DROP TABLE IF EXISTS `inspection_photos`;
CREATE TABLE `inspection_photos`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `detail_id` bigint(20) UNSIGNED NOT NULL,
  `result_id` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `photo_path` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_photos_details`(`detail_id` ASC) USING BTREE,
  INDEX `fk_photos_results`(`result_id` ASC) USING BTREE,
  CONSTRAINT `fk_photos_details` FOREIGN KEY (`detail_id`) REFERENCES `inspection_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_photos_results` FOREIGN KEY (`result_id`) REFERENCES `inspection_results` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_photos
-- ----------------------------

-- ----------------------------
-- Table structure for inspection_results
-- ----------------------------
DROP TABLE IF EXISTS `inspection_results`;
CREATE TABLE `inspection_results`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `detail_id` bigint(20) UNSIGNED NOT NULL,
  `template_item_id` bigint(20) UNSIGNED NOT NULL,
  `result_value` enum('pass','fail','na') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pass',
  `boolean_value` tinyint(1) NULL DEFAULT NULL,
  `numeric_value` decimal(10, 2) NULL DEFAULT NULL,
  `text_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_results_template_items`(`template_item_id` ASC) USING BTREE,
  INDEX `idx_results_detail`(`detail_id` ASC) USING BTREE,
  CONSTRAINT `fk_results_details` FOREIGN KEY (`detail_id`) REFERENCES `inspection_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_results_template_items` FOREIGN KEY (`template_item_id`) REFERENCES `inspection_template_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 109 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_results
-- ----------------------------
INSERT INTO `inspection_results` VALUES (1, 1, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (2, 1, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (3, 1, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (4, 1, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (5, 1, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (6, 1, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (7, 1, 7, 'pass', NULL, 54.00, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (8, 1, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (9, 1, 9, 'pass', NULL, NULL, '77', NULL, '2026-07-04 16:09:50', '2026-07-04 16:09:50', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (10, 2, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (11, 2, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (12, 2, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (13, 2, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (14, 2, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (15, 2, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (16, 2, 7, 'pass', NULL, 77.00, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (17, 2, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (18, 2, 9, 'pass', NULL, NULL, '77', NULL, '2026-07-04 16:10:02', '2026-07-04 16:10:02', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (19, 3, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (20, 3, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (21, 3, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (22, 3, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (23, 3, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (24, 3, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (25, 3, 7, 'pass', NULL, 55.00, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (26, 3, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (27, 3, 9, 'pass', NULL, NULL, '77', NULL, '2026-07-04 16:10:20', '2026-07-04 16:10:20', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (28, 4, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (29, 4, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (30, 4, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (31, 4, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (32, 4, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (33, 4, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (34, 4, 7, 'pass', NULL, 45.00, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (35, 4, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (36, 4, 9, 'pass', NULL, NULL, '54', NULL, '2026-07-04 16:10:56', '2026-07-04 16:10:56', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (37, 5, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (38, 5, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (39, 5, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (40, 5, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (41, 5, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (42, 5, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (43, 5, 7, 'pass', NULL, 55.00, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (44, 5, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (45, 5, 9, 'pass', NULL, NULL, '44', NULL, '2026-07-04 16:12:21', '2026-07-04 16:12:21', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (46, 6, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (47, 6, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (48, 6, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (49, 6, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (50, 6, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (51, 6, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (52, 6, 7, 'pass', NULL, 45.00, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (53, 6, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (54, 6, 9, 'pass', NULL, NULL, '54', NULL, '2026-07-04 16:12:29', '2026-07-04 16:12:29', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (55, 7, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (56, 7, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (57, 7, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (58, 7, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (59, 7, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (60, 7, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (61, 7, 7, 'pass', NULL, 44.00, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (62, 7, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (63, 7, 9, 'pass', NULL, NULL, '5', NULL, '2026-07-04 16:12:36', '2026-07-04 16:12:36', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (64, 8, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (65, 8, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (66, 8, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (67, 8, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (68, 8, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (69, 8, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (70, 8, 7, 'pass', NULL, 4.00, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (71, 8, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (72, 8, 9, 'pass', NULL, NULL, '22', NULL, '2026-07-04 16:12:42', '2026-07-04 16:12:42', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (73, 9, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (74, 9, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (75, 9, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (76, 9, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (77, 9, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (78, 9, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (79, 9, 7, 'pass', NULL, 55.00, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (80, 9, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (81, 9, 9, 'pass', NULL, NULL, '44', NULL, '2026-07-04 16:13:07', '2026-07-04 16:13:07', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (82, 10, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (83, 10, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (84, 10, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (85, 10, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (86, 10, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (87, 10, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (88, 10, 7, 'pass', NULL, 44.00, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (89, 10, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (90, 10, 9, 'pass', NULL, NULL, '22', NULL, '2026-07-04 16:13:14', '2026-07-04 16:13:14', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (91, 11, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (92, 11, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (93, 11, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (94, 11, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (95, 11, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (96, 11, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (97, 11, 7, 'pass', NULL, 55.00, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (98, 11, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (99, 11, 9, 'pass', NULL, NULL, '44', NULL, '2026-07-05 07:02:28', '2026-07-05 07:02:28', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (100, 12, 1, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (101, 12, 2, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (102, 12, 3, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (103, 12, 4, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (104, 12, 5, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (105, 12, 6, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (106, 12, 7, 'pass', NULL, 55.00, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (107, 12, 8, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);
INSERT INTO `inspection_results` VALUES (108, 12, 9, 'pass', NULL, NULL, '55', NULL, '2026-07-05 07:06:25', '2026-07-05 07:06:25', NULL, 1, 1);

-- ----------------------------
-- Table structure for inspection_sessions
-- ----------------------------
DROP TABLE IF EXISTS `inspection_sessions`;
CREATE TABLE `inspection_sessions`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `inspector_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('in_progress','completed','canceled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_progress',
  `started_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_sessions_users`(`inspector_id` ASC) USING BTREE,
  INDEX `idx_sessions_status`(`status` ASC) USING BTREE,
  CONSTRAINT `fk_sessions_users` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_sessions
-- ----------------------------
INSERT INTO `inspection_sessions` VALUES (1, 1, 'completed', '2026-07-04 16:09:35', '2026-07-04 21:37:25', '2026-07-04 16:09:35', '2026-07-04 21:37:25', NULL, 1, 1);
INSERT INTO `inspection_sessions` VALUES (2, 1, 'completed', '2026-07-04 16:10:47', '2026-07-04 16:13:39', '2026-07-04 16:10:47', '2026-07-04 16:13:39', NULL, 1, 1);
INSERT INTO `inspection_sessions` VALUES (3, 1, 'completed', '2026-07-05 06:32:04', '2026-07-05 21:02:27', '2026-07-05 06:32:04', '2026-07-05 21:02:27', NULL, 1, 1);

-- ----------------------------
-- Table structure for inspection_template_items
-- ----------------------------
DROP TABLE IF EXISTS `inspection_template_items`;
CREATE TABLE `inspection_template_items`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) UNSIGNED NOT NULL,
  `item_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `item_type` enum('boolean','numeric','text') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'boolean',
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_inspection_template_items_template_id`(`template_id` ASC) USING BTREE,
  CONSTRAINT `fk_inspection_template_items_templates` FOREIGN KEY (`template_id`) REFERENCES `inspection_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_template_items
-- ----------------------------
INSERT INTO `inspection_template_items` VALUES (1, 1, 'สถานะไฟเลี้ยง (Power LED Status)', 'ตรวจสอบว่าไฟ LED สีเขียวของแหล่งจ่ายไฟหลักและสำรอง (Power Supply) ติดสว่างปกติหรือไม่', 'boolean', 1, 1, '2026-07-04 03:23:27', '2026-07-04 20:13:43', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (2, 1, 'สถานะไฟแจ้งเตือน (Alarm LED Status)', 'ตรวจสอบว่าไม่มีไฟเตือนสีแดง สีส้ม หรือไฟกะพริบแจ้งเตือนใดๆ บนตัวเครื่อง', 'boolean', 2, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (3, 1, 'การเชื่อมต่อสายเน็ตเวิร์ก (Network Cable Connection)', 'ตรวจสอบว่าสาย LAN และสาย Fiber Optic เสียบแน่นปกติ และมีไฟกะพริบแสดงสถานะเชื่อมต่อ', 'boolean', 3, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (4, 1, 'การเสียบสายไฟ (Power Cable Connection)', 'ตรวจสอบว่าสายไฟหลักเสียบแน่นอยู่กับตู้ PDU/UPS และมีตัวล็อกสายยึดไว้แน่นหนา', 'boolean', 4, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (5, 1, 'การสะสมของฝุ่น (Dust Accumulation)', 'ตรวจสอบหน้ากากช่องระบายอากาศและแผ่นกรองฝุ่นว่าไม่มีฝุ่นอุดตันหนาแน่น', 'boolean', 5, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (6, 1, 'เสียงและการทำงานของพัดลม (Fan Sound & Speed)', 'สังเกตและฟังเสียงว่าพัดลมระบายอากาศไม่มีเสียงดังปกติ หรือสั่นสะเทือนผิดปกติ', 'boolean', 6, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (7, 1, 'อุณหภูมิเครื่อง (Temperature Celsius)', 'อ่านค่าอุณหภูมิดิจิตอลจากตู้แร็คหรือเครื่องเซิร์ฟเวอร์ (ระบุเป็นองศาเซลเซียส)', 'numeric', 7, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (8, 1, 'สภาพความเสียหายภายนอก (Physical Damage Status)', 'ตรวจสอบว่าตัวเครื่องภายนอกไม่มีรอยบุบ สนิม หรือร่องรอยการงัดแงะทำลาย', 'boolean', 8, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (9, 1, 'หมายเหตุเพิ่มเติม (Remark)', 'ระบุข้อมูลความผิดปกติที่พบ หรือการดำเนินการแก้ไขเบื้องต้น (ถ้ามี)', 'text', 9, 1, '2026-07-04 03:23:27', '2026-07-04 15:55:19', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (10, 2, '???????????????????????????????????????????????? VM (Power State)', '?????????????????????????????? VM ????????????????????????????????? Running ???????????? ?????????????????? Stopped ???????????? Suspended', 'boolean', 1, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (11, 2, '??????????????????????????? CPU (<80%)', '?????????????????????????????? CPU utilization ????????????????????? 80% ?????????????????? 15 ???????????????????????????????????????', 'boolean', 2, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (12, 2, '??????????????????????????? RAM (<85%)', '?????????????????????????????? RAM utilization ????????????????????? 85% ????????? Memory ????????????????????????????????????', 'boolean', 3, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (13, 2, '????????????????????????????????????????????????????????? (>10% ????????????)', '?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? 10% ?????? Volume ????????????', 'boolean', 4, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (14, 2, '??????????????????????????????????????????????????????????????? (Network Ping)', 'Ping ??????????????? IP ????????? VM ??????????????????????????????????????????????????????????????????????????? 10ms', 'boolean', 5, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (15, 2, '?????????????????????????????????????????????????????????????????? (Uptime ?????????)', '??????????????????????????????????????????????????? VM ???????????????????????????????????????????????????????????? Reboot', 'numeric', 6, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (16, 2, '??????????????? Backup ??????????????????', '?????????????????????????????? Backup ?????????????????????????????????????????????????????????????????? 24 ????????????????????????????????????????????????', 'boolean', 7, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (17, 2, '??????????????? Security Patch / OS Update', '?????????????????????????????? OS ?????????????????? Security Patch ?????????????????????????????????????????? Critical Update ????????????????????????', 'boolean', 8, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (18, 2, '??????????????? Application Service', '?????????????????????????????? Service ???????????????????????????????????? VM ???????????????????????????????????? (???????????? IIS, Apache, Oracle, etc.)', 'boolean', 9, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);
INSERT INTO `inspection_template_items` VALUES (19, 2, '????????????????????????', '?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????', 'text', 10, 1, '2026-07-05 06:50:46', '2026-07-05 06:50:46', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for inspection_templates
-- ----------------------------
DROP TABLE IF EXISTS `inspection_templates`;
CREATE TABLE `inspection_templates`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` enum('physical_server','vm') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'physical_server',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_inspection_templates_target_type`(`target_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_templates
-- ----------------------------
INSERT INTO `inspection_templates` VALUES (1, 'แบบฟอร์มเดินตรวจห้อง Server ทั่วไปประจำวัน V1', 'physical_server', 1, '2026-07-04 03:23:27', '2026-07-04 21:52:23', NULL, NULL, NULL);
INSERT INTO `inspection_templates` VALUES (2, 'ตรวจ Virtual Machine  V1', 'vm', 1, '2026-07-05 06:50:46', '2026-07-05 06:51:48', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('uninspected_room','uninspected_rack','uninspected_server','inspection_fail','daily_summary') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'daily_summary',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_notifications_is_read`(`is_read` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notifications
-- ----------------------------

-- ----------------------------
-- Table structure for physical_servers
-- ----------------------------
DROP TABLE IF EXISTS `physical_servers`;
CREATE TABLE `physical_servers`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `rack_id` bigint(20) UNSIGNED NOT NULL,
  `asset_type_id` bigint(20) UNSIGNED NOT NULL,
  `server_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `serial_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `asset_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `rack_position_u` int(10) UNSIGNED NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('active','inactive','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `serial_number`(`serial_number` ASC) USING BTREE,
  UNIQUE INDEX `asset_number`(`asset_number` ASC) USING BTREE,
  INDEX `idx_physical_servers_rack_id`(`rack_id` ASC) USING BTREE,
  INDEX `idx_physical_servers_asset_type_id`(`asset_type_id` ASC) USING BTREE,
  CONSTRAINT `fk_physical_servers_asset_types` FOREIGN KEY (`asset_type_id`) REFERENCES `asset_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_physical_servers_racks` FOREIGN KEY (`rack_id`) REFERENCES `racks` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of physical_servers
-- ----------------------------
INSERT INTO `physical_servers` VALUES (1, 1, 1, 'HIS-DB-01', 'Dell PowerEdge R750', 'DELL-SN-12345', '10.200.1.10', 'ASSET-IT-0001', 10, 'Primary Hospital Information System Database Server', 'active', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `physical_servers` VALUES (2, 1, 1, 'HIS-APP-01', 'Dell PowerEdge R750', 'DELL-SN-67890', '10.200.1.11', 'ASSET-IT-0002', 12, 'Primary Hospital Information System Application Server', 'active', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `physical_servers` VALUES (3, 2, 2, 'Core-Switch-01', 'Cisco Catalyst 9300', 'CISCO-SN-9999', '10.200.1.1', 'ASSET-IT-0003', 40, 'Main Core Switch Room A', 'active', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `physical_servers` VALUES (4, 2, 4, 'Main-Firewall-01', 'FortiGate 200F', 'FORTI-SN-8888', '10.200.1.254', 'ASSET-IT-0004', 42, 'Primary Hospital Network Edge Firewall', 'active', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `physical_servers` VALUES (5, 3, 1, 'DR-Server-01', 'HP ProLiant DL380 Gen10', 'HP-SN-77777', '10.200.2.10', 'ASSET-IT-0005', 15, 'Disaster Recovery and Backup Host Server', 'active', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for racks
-- ----------------------------
DROP TABLE IF EXISTS `racks`;
CREATE TABLE `racks`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `rack_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_size` int(10) UNSIGNED NOT NULL DEFAULT 42,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_racks_room_id`(`room_id` ASC) USING BTREE,
  CONSTRAINT `fk_racks_rooms` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of racks
-- ----------------------------
INSERT INTO `racks` VALUES (1, 1, 'Rack A-01', 42, 'Hosts database and application servers', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `racks` VALUES (2, 1, 'Rack A-02', 42, 'Hosts network switches and firewalls', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `racks` VALUES (3, 2, 'Rack B-01', 42, 'Hosts DR/Backup servers and backup switches', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `role_name`(`role_name` ASC) USING BTREE,
  UNIQUE INDEX `role_code`(`role_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'System Administrator', 'ADMIN', 'Full system access and management privileges', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `roles` VALUES (2, 'Inspector Technician', 'INSPECTOR', 'Walkthrough inspection rights', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `roles` VALUES (3, 'Executive Viewer', 'VIEWER', 'Read-only access to dashboard and reports', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for rooms
-- ----------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `building` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rooms
-- ----------------------------
INSERT INTO `rooms` VALUES (1, 'Main Server Room A', '4th Floor', 'IT Building', 'Primary datacenter for hospital core systems', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `rooms` VALUES (2, 'Backup Server Room B', '2nd Floor', 'Outpatient Department Building', 'Secondary backup and DR site datacenter', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `setting_key`(`setting_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES (1, 'hospital_name', 'โรงพยาบาลนาโพธิ์', 'โรงพยาบาลนาโพธิ์', '2026-07-04 03:23:27', '2026-07-04 21:41:31', NULL, NULL, NULL);
INSERT INTO `settings` VALUES (2, 'sys_log_retention_days', '90', 'จำนวนวันที่เก็บประวัติการตรวจสอบย้อนหลัง', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `settings` VALUES (3, 'maintenance_contact', 'ศูนย์ไอที เบอร์โทร 1122', 'ข้อมูลติดต่อฝ่ายช่างหรือไอทีผู้ดูแลตึกคอมพิวเตอร์', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `settings` VALUES (4, 'inspections_per_day', '1', 'จำนวนรอบที่อนุญาตให้เดินตรวจต่อวัน (เริ่มต้นคือ 1)', '2026-07-04 15:58:43', '2026-07-04 21:50:58', NULL, NULL, NULL);
INSERT INTO `settings` VALUES (5, 'line_client_key', '8f7d9692426f4c37ced26f00f60f1ebb13ca0978', 'MOPH Line Notify Client Key', '2026-07-04 20:41:38', '2026-07-04 20:52:59', NULL, NULL, NULL);
INSERT INTO `settings` VALUES (6, 'line_secret_key', 'O3DSI5QIAGE37IRSDV2ZYXEQECJY', 'MOPH Line Notify Secret Key', '2026-07-04 20:41:38', '2026-07-04 20:52:59', NULL, NULL, NULL);
INSERT INTO `settings` VALUES (7, 'notification_time', '22:00', 'เวลาส่งการแจ้งเตือนสรุปประจำวัน (รูปแบบ HH:MM)', '2026-07-04 20:41:38', '2026-07-04 20:52:59', NULL, NULL, NULL);
INSERT INTO `settings` VALUES (8, 'is_notification_enabled', '1', 'เปิด/ปิด การแจ้งเตือนทางไลน์ (1 = เปิด, 0 = ปิด)', '2026-07-04 20:41:38', '2026-07-04 20:52:59', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `fk_users_roles`(`role_id` ASC) USING BTREE,
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 1, 'System Administrator', 'admin@hospital.go.th', 1, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `users` VALUES (2, 'inspector1', 'd899f47283d49dce931d95081a21c20051d0f70109fd9ae6d6774601274190da', 2, 'John Doe (Inspector)', 'john.doe@hospital.go.th', 1, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `users` VALUES (3, 'viewer1', '65375049b9e4d7cad6c9ba286fdeb9394b28135a3e84136404cfccfdcc438894', 3, 'Jane Smith (Director)', 'jane.smith@hospital.go.th', 1, '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for virtual_machines
-- ----------------------------
DROP TABLE IF EXISTS `virtual_machines`;
CREATE TABLE `virtual_machines`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `physical_server_id` bigint(20) UNSIGNED NOT NULL,
  `vm_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `os_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('running','stopped','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'running',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_vms_physical_server_id`(`physical_server_id` ASC) USING BTREE,
  CONSTRAINT `fk_virtual_machines_physical_servers` FOREIGN KEY (`physical_server_id`) REFERENCES `physical_servers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of virtual_machines
-- ----------------------------
INSERT INTO `virtual_machines` VALUES (1, 1, 'VM-HIS-Database', '10.200.1.20', 'Red Hat Enterprise Linux 8.5', 'Main database instance running Oracle 19c', 'running', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `virtual_machines` VALUES (2, 1, 'VM-HIS-ReadReplica', '10.200.1.21', 'Red Hat Enterprise Linux 8.5', 'Read-only replica database for analytical reports', 'running', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `virtual_machines` VALUES (3, 2, 'VM-HIS-IIS-Web01', '10.200.1.30', 'Windows Server 2019', 'Web client frontend server', 'running', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `virtual_machines` VALUES (4, 2, 'VM-PACS-Server', '10.200.1.35', 'Windows Server 2019', 'Picture Archiving and Communication System Server', 'running', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);
INSERT INTO `virtual_machines` VALUES (5, 5, 'VM-DR-HIS-Database', '10.200.2.20', 'Red Hat Enterprise Linux 8.5', 'Standby database replication host', 'stopped', '2026-07-04 03:23:27', '2026-07-04 03:23:27', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for vm_inspection_details
-- ----------------------------
DROP TABLE IF EXISTS `vm_inspection_details`;
CREATE TABLE `vm_inspection_details`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `vm_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pass','warning','fail') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pass',
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_vm_details_session`(`session_id` ASC) USING BTREE,
  INDEX `idx_vm_details_vm_id`(`vm_id` ASC) USING BTREE,
  CONSTRAINT `fk_vm_details_sessions` FOREIGN KEY (`session_id`) REFERENCES `vm_inspection_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vm_details_vms` FOREIGN KEY (`vm_id`) REFERENCES `virtual_machines` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vm_inspection_details
-- ----------------------------
INSERT INTO `vm_inspection_details` VALUES (1, 1, 1, 'pass', '', '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_details` VALUES (2, 1, 5, 'pass', '', '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_details` VALUES (3, 1, 3, 'pass', '', '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_details` VALUES (4, 1, 4, 'pass', '', '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_details` VALUES (5, 1, 2, 'pass', '', '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);

-- ----------------------------
-- Table structure for vm_inspection_results
-- ----------------------------
DROP TABLE IF EXISTS `vm_inspection_results`;
CREATE TABLE `vm_inspection_results`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `detail_id` bigint(20) UNSIGNED NOT NULL,
  `template_item_id` bigint(20) UNSIGNED NOT NULL,
  `result_value` enum('pass','fail','na') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pass',
  `boolean_value` tinyint(1) NULL DEFAULT NULL,
  `numeric_value` decimal(10, 2) NULL DEFAULT NULL,
  `text_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `remark` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_vm_results_template_items`(`template_item_id` ASC) USING BTREE,
  INDEX `idx_vm_results_detail`(`detail_id` ASC) USING BTREE,
  CONSTRAINT `fk_vm_results_details` FOREIGN KEY (`detail_id`) REFERENCES `vm_inspection_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vm_results_template_items` FOREIGN KEY (`template_item_id`) REFERENCES `inspection_template_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 51 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vm_inspection_results
-- ----------------------------
INSERT INTO `vm_inspection_results` VALUES (1, 1, 10, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (2, 1, 11, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (3, 1, 12, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (4, 1, 13, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (5, 1, 14, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (6, 1, 15, 'pass', NULL, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (7, 1, 16, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (8, 1, 17, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (9, 1, 18, 'pass', 1, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (10, 1, 19, 'pass', NULL, NULL, NULL, NULL, '2026-07-05 06:56:01', '2026-07-05 06:56:01', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (11, 2, 10, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (12, 2, 11, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (13, 2, 12, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (14, 2, 13, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (15, 2, 14, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (16, 2, 15, 'pass', NULL, 55.00, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (17, 2, 16, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (18, 2, 17, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (19, 2, 18, 'pass', 1, NULL, NULL, NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (20, 2, 19, 'pass', NULL, NULL, '44', NULL, '2026-07-05 07:01:46', '2026-07-05 07:01:46', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (21, 3, 10, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (22, 3, 11, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (23, 3, 12, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (24, 3, 13, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (25, 3, 14, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (26, 3, 15, 'pass', NULL, 55.00, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (27, 3, 16, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (28, 3, 17, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (29, 3, 18, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (30, 3, 19, 'pass', NULL, NULL, '66', NULL, '2026-07-05 20:07:00', '2026-07-05 20:07:00', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (31, 4, 10, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (32, 4, 11, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (33, 4, 12, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (34, 4, 13, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (35, 4, 14, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (36, 4, 15, 'pass', NULL, 55.00, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (37, 4, 16, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (38, 4, 17, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (39, 4, 18, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (40, 4, 19, 'pass', NULL, NULL, '44', NULL, '2026-07-05 20:09:11', '2026-07-05 20:09:11', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (41, 5, 10, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (42, 5, 11, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (43, 5, 12, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (44, 5, 13, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (45, 5, 14, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (46, 5, 15, 'pass', NULL, 55.00, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (47, 5, 16, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (48, 5, 17, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (49, 5, 18, 'pass', 1, NULL, NULL, NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);
INSERT INTO `vm_inspection_results` VALUES (50, 5, 19, 'pass', NULL, NULL, '44', NULL, '2026-07-05 20:09:42', '2026-07-05 20:09:42', NULL, 1, 1);

-- ----------------------------
-- Table structure for vm_inspection_sessions
-- ----------------------------
DROP TABLE IF EXISTS `vm_inspection_sessions`;
CREATE TABLE `vm_inspection_sessions`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `inspector_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('in_progress','completed','canceled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_progress',
  `started_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_vm_sessions_status`(`status` ASC) USING BTREE,
  INDEX `idx_vm_sessions_inspector`(`inspector_id` ASC) USING BTREE,
  CONSTRAINT `fk_vm_sessions_users` FOREIGN KEY (`inspector_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vm_inspection_sessions
-- ----------------------------
INSERT INTO `vm_inspection_sessions` VALUES (1, 1, 'completed', '2026-07-05 06:52:17', '2026-07-05 20:09:49', '2026-07-05 06:52:17', '2026-07-05 20:09:49', NULL, 1, 1);

SET FOREIGN_KEY_CHECKS = 1;
