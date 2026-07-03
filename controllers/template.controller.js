const TemplateService = require('../services/template.service');

class TemplateController {
  // GET /templates
  static async listTemplates(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await TemplateService.getPagedTemplates(search, page, limit);

      res.render('template/index', {
        title: 'Inspection Templates - Server Check',
        currentPage: 'templates',
        templates: result.data,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /templates
  static async createTemplate(req, res, next) {
    try {
      await TemplateService.createTemplate(req.body);
      res.redirect('/templates?success=Template created successfully');
    } catch (err) {
      res.redirect(`/templates?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /templates/:id/update
  static async updateTemplate(req, res, next) {
    try {
      await TemplateService.updateTemplate(req.params.id, req.body);
      res.redirect('/templates?success=Template updated successfully');
    } catch (err) {
      res.redirect(`/templates?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /templates/:id/delete
  static async deleteTemplate(req, res, next) {
    try {
      await TemplateService.deleteTemplate(req.params.id);
      res.redirect('/templates?success=Template deleted successfully');
    } catch (err) {
      res.redirect(`/templates?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /templates/export
  static async exportTemplates(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await TemplateService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=templates-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /templates/import
  static async importTemplates(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await TemplateService.importCSV(csvText);
      res.redirect(`/templates?success=Successfully imported ${count} templates.`);
    } catch (err) {
      res.redirect(`/templates?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = TemplateController;
