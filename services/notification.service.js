const NotificationRepository = require('../repositories/notification.repository');
const SettingRepository = require('../repositories/setting.repository');
const { sendMophNotifyText } = require('../helpers/line.helper');

class NotificationService {
  /**
   * Fetch paginated notifications list for web notification center
   */
  static async getPagedNotifications(page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const offset = (pageNum - 1) * limitNum;

    const [notifications, totalRecords] = await Promise.all([
      NotificationRepository.findAll(limitNum, offset),
      NotificationRepository.countAll()
    ]);

    const totalPages = Math.ceil(totalRecords / limitNum);

    // Make BigInt IDs safe for JSON serialization
    const safeNotifications = notifications.map(n => ({
      ...n,
      id: Number(n.id)
    }));

    return {
      data: safeNotifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  /**
   * Get total number of unread notifications
   */
  static async getUnreadCount() {
    return await NotificationRepository.countUnread();
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id) {
    return await NotificationRepository.markAsRead(id);
  }

  /**
   * Mark all unread notifications as read
   */
  static async markAllAsRead() {
    return await NotificationRepository.markAllAsRead();
  }

  /**
   * Delete a notification record
   */
  static async deleteNotification(id) {
    return await NotificationRepository.delete(id);
  }

  /**
   * Get notification settings helper
   */
  static async getNotificationSettings() {
    const [enabledSet, clientSet, secretSet, timeSet] = await Promise.all([
      SettingRepository.findByKey('is_notification_enabled'),
      SettingRepository.findByKey('line_client_key'),
      SettingRepository.findByKey('line_secret_key'),
      SettingRepository.findByKey('notification_time')
    ]);

    return {
      isEnabled: enabledSet ? enabledSet.setting_value === '1' : true,
      clientKey: clientSet ? clientSet.setting_value : '',
      secretKey: secretSet ? secretSet.setting_value : '',
      notificationTime: timeSet ? timeSet.setting_value : '18:00'
    };
  }

  /**
   * Send an immediate LINE alert for a FAIL event
   */
  static async sendImmediateFailAlert(serverName, roomName, rackName, checkItemName, remark, inspectorName, sessionId) {
    const settings = await this.getNotificationSettings();

    // 1. Create a notification record in database for Web UI dashboard bell icon
    const title = '🚨 [ตรวจพบความผิดปกติ] ' + serverName;
    const message = `เครื่องเซิร์ฟเวอร์ ${serverName} (ห้อง ${roomName} / ตู้ ${rackName}) พบความผิดปกติที่หัวข้อ "${checkItemName}" โดยมีบันทึกหมายเหตุ: ${remark || 'ไม่มี'} (ผู้บันทึก: ${inspectorName}, รอบตรวจ: #${sessionId})`;

    await NotificationRepository.create({
      title,
      message,
      type: 'inspection_fail'
    });

    // 2. If LINE notifications are disabled, stop here
    if (!settings.isEnabled || !settings.clientKey || !settings.secretKey) {
      console.log('LINE notification is disabled or keys are missing.');
      return;
    }

    // 3. Build LINE text message (short and clear)
    const lineText = 
      `🚨 [แจ้งเตือนด่วน] พบเครื่องเซิร์ฟเวอร์ผิดปกติ!\n\n` +
      `🖥️ อุปกรณ์: ${serverName}\n` +
      `📍 พิกัด: ห้อง ${roomName} / ตู้ ${rackName}\n` +
      `🔍 หัวข้อที่พบปัญหา: ${checkItemName}\n` +
      `💬 หมายเหตุ: ${remark || '-'}\n` +
      `✍️ ผู้ตรวจสอบ: ${inspectorName}\n` +
      `📋 รหัสรอบตรวจ: #${sessionId}`;

    try {
      await sendMophNotifyText(lineText, settings.clientKey, settings.secretKey);
      console.log(`LINE FAIL alert sent successfully for ${serverName}`);
    } catch (err) {
      console.error('Failed to send LINE FAIL alert:', err.message);
    }
  }

  /**
   * Send daily walking check summary (Short version)
   */
  static async sendDailySummary() {
    const settings = await this.getNotificationSettings();

    // 1. Fetch today's inspection statistics
    const stats = await NotificationRepository.getDailySummaryStats();

    const todayStr = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const currentHourStr = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // 2. Create database notification record
    const title = '📋 สรุปผลการเดินตรวจประจำวัน';
    const message = `ประจำวันที่ ${todayStr} - ตรวจแล้ว ${stats.completedRounds} รอบ, ตรวจสอบอุปกรณ์ ${stats.totalInspected} เครื่อง (ปกติ: ${stats.passCount}, เฝ้าระวัง: ${stats.warnCount}, ผิดปกติ: ${stats.failCount}), อุปกรณ์คงค้าง: ${stats.remainingUninspected} เครื่อง`;

    await NotificationRepository.create({
      title,
      message,
      type: 'daily_summary'
    });

    // 3. If LINE notifications are disabled, stop here
    if (!settings.isEnabled || !settings.clientKey || !settings.secretKey) {
      console.log('LINE notification is disabled or keys are missing for daily summary.');
      return;
    }

    // 4. Build concise LINE message
    let lineText = 
      `📋 [สรุปผลการเดินตรวจประจำวัน]\n` +
      `🗓️ วันที่: ${todayStr}\n` +
      `🕒 เวลาสรุป: ${currentHourStr} น.\n\n` +
      `✅ ดำเนินการเสร็จสิ้น: ${stats.completedRounds} รอบตรวจ\n` +
      `🖥️ อุปกรณ์ที่ตรวจวันนี้: ${stats.totalInspected} เครื่อง\n` +
      `   • ปกติ (PASS): ${stats.passCount} เครื่อง\n` +
      `   • เฝ้าระวัง (WARN): ${stats.warnCount} เครื่อง\n` +
      `   • ผิดปกติ (FAIL): ${stats.failCount} เครื่อง ${stats.failCount > 0 ? '🚨' : ''}\n\n`;

    if (stats.remainingUninspected === 0) {
      lineText += `⚠️ อุปกรณ์คงค้าง (ไม่ได้ตรวจ): 0 เครื่อง (ตรวจครบ 100% 🎉)`;
    } else {
      lineText += `⚠️ อุปกรณ์คงค้าง (ไม่ได้ตรวจ): ${stats.remainingUninspected} เครื่อง\n`;
      const maxShow = 5;
      const listed = stats.uninspectedServers.slice(0, maxShow);
      listed.forEach(srv => {
        lineText += `   • ${srv.server_name} (${srv.rack_name} / ${srv.room_name})\n`;
      });
      if (stats.uninspectedServers.length > maxShow) {
        lineText += `   ... และอีก ${stats.uninspectedServers.length - maxShow} เครื่อง`;
      }
    }

    try {
      await sendMophNotifyText(lineText, settings.clientKey, settings.secretKey);
      console.log('Daily LINE summary notification sent successfully.');
    } catch (err) {
      console.error('Failed to send daily LINE summary:', err.message);
    }
  }
}

module.exports = NotificationService;
