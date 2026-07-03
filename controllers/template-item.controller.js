const TemplateItemService = require('../services/template-item.service');
const TemplateRepository = require('../repositories/template.repository');

class TemplateItemController {
  // GET /template-items
  static async listTemplateItems(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await TemplateItemService.getPagedTemplateItems(search, page, limit);
      const templates = await TemplateRepository.findAll('', 1000, 0);

      res.render('template-item/index', {
        title: 'Inspection Template Items - Server Check',
        currentPage: 'templates',
        templateItems: result.data,
        templates,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /template-items
  static async createTemplateItem(req, res, next) {
    try {
      await TemplateItemService.createTemplateItem(req.body);
      res.redirect('/template-items?success=Template item created successfully');
    } catch (err) {
      res.redirect(`/template-items?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /template-items/:id/update
  static async updateTemplateItem(req, res, next) {
    try {
      await TemplateItemService.updateTemplateItem(req.params.id, req.body);
      res.redirect('/template-items?success=Template item updated successfully');
    } catch (err) {
      res.redirect(`/template-items?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /template-items/:id/delete
  static async deleteTemplateItem(req, res, next) {
    try {
      await TemplateItemService.deleteTemplateItem(req.params.id);
      res.redirect('/template-items?success=Template item deleted successfully');
    } catch (err) {
      res.redirect(`/template-items?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /template-items/export
  static async exportTemplateItems(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await TemplateItemService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=template-items-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /template-items/import
  static async importTemplateItems(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await TemplateItemService.importCSV(csvText);
      res.redirect(`/template-items?success=Successfully imported ${count} template items.`);
    } catch (err) {
      res.redirect(`/template-items?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = TemplateItemController;
