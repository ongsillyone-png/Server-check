const SettingService = require('../services/setting.service');

class SettingController {
  // GET /settings
  static async listSettings(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await SettingService.getPagedSettings(search, page, limit);

      res.render('setting/index', {
        title: 'System Settings - Server Check',
        currentPage: 'templates', // Using existing categories, or customize
        settings: result.data,
        pagination: result.pagination,
        search,
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
}

module.exports = SettingController;
