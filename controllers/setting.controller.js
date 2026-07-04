const SettingService = require('../services/setting.service');

class SettingController {
  // GET /settings
  static async listSettings(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await SettingService.getPagedSettings(search, page, limit);

      const NotificationService = require('../services/notification.service');
      const notifySettings = await NotificationService.getNotificationSettings();

      res.render('setting/index', {
        title: 'System Settings - Server Check',
        currentPage: 'settings',
        settings: result.data,
        pagination: result.pagination,
        search,
        notifySettings,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /settings
  static async createSetting(req, res, next) {
    try {
      await SettingService.createSetting(req.body);
      res.redirect('/settings?success=Setting created successfully');
    } catch (err) {
      res.redirect(`/settings?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /settings/:id/update
  static async updateSetting(req, res, next) {
    try {
      await SettingService.updateSetting(req.params.id, req.body);
      res.redirect('/settings?success=Setting updated successfully');
    } catch (err) {
      res.redirect(`/settings?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /settings/:id/delete
  static async deleteSetting(req, res, next) {
    try {
      await SettingService.deleteSetting(req.params.id);
      res.redirect('/settings?success=Setting deleted successfully');
    } catch (err) {
      res.redirect(`/settings?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /settings/export
  static async exportSettings(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await SettingService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=settings-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /settings/import
  static async importSettings(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await SettingService.importCSV(csvText);
      res.redirect(`/settings?success=Successfully imported ${count} settings.`);
    } catch (err) {
      res.redirect(`/settings?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Save LINE notification keys, time, and switch status to database
   * POST /settings/notifications
   */
  static async updateNotificationSettings(req, res, next) {
    try {
      const SettingRepository = require('../repositories/setting.repository');
      const { line_client_key, line_secret_key, notification_time, is_notification_enabled } = req.body;

      const updates = {
        line_client_key: line_client_key || '',
        line_secret_key: line_secret_key || '',
        notification_time: notification_time || '18:00',
        is_notification_enabled: is_notification_enabled === '1' ? '1' : '0'
      };

      for (const [key, val] of Object.entries(updates)) {
        const setting = await SettingRepository.findByKey(key);
        if (setting) {
          await SettingRepository.update(setting.id, {
            setting_key: key,
            setting_value: val,
            description: setting.description
          });
        }
      }

      res.redirect('/settings?success=อัปเดตการตั้งค่าการแจ้งเตือน LINE เรียบร้อยแล้ว');
    } catch (err) {
      res.redirect(`/settings?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Trigger a test notification via MOPH LINE API
   * POST /settings/notifications/test
   */
  static async testNotification(req, res, next) {
    try {
      const { line_client_key, line_secret_key } = req.body;
      const { sendMophNotifyText } = require('../helpers/line.helper');

      const testMsg = `🔔 [ทดสอบการเชื่อมต่อ LINE]\n\n` +
        `ระบบ Server Check เดินตรวจเช็คระบบโรงพยาบาลได้ทำการทดสอบการแจ้งเตือนความผิดปกติสำเร็จแล้ว\n` +
        `🗓️ วันทดสอบ: ${new Date().toLocaleDateString('th-TH')}\n` +
        `🕒 เวลา: ${new Date().toLocaleTimeString('th-TH')}\n` +
        `✅ สถานะ: การเชื่อมต่อสมบูรณ์!`;

      const result = await sendMophNotifyText(testMsg, line_client_key, line_secret_key);
      res.json({ success: true, response: result });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  }
}

module.exports = SettingController;
