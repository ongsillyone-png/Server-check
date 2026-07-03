const AssetTypeService = require('../services/asset-type.service');

class AssetTypeController {
  // GET /asset-types
  static async listAssetTypes(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await AssetTypeService.getPagedAssetTypes(search, page, limit);

      res.render('asset-type/index', {
        title: 'Asset Type Management - Server Check',
        currentPage: 'servers', // Keep highlighting servers inventory
        assetTypes: result.data,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /asset-types
  static async createAssetType(req, res, next) {
    try {
      await AssetTypeService.createAssetType(req.body);
      res.redirect('/asset-types?success=Asset type created successfully');
    } catch (err) {
      res.redirect(`/asset-types?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /asset-types/:id/update
  static async updateAssetType(req, res, next) {
    try {
      await AssetTypeService.updateAssetType(req.params.id, req.body);
      res.redirect('/asset-types?success=Asset type updated successfully');
    } catch (err) {
      res.redirect(`/asset-types?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /asset-types/:id/delete
  static async deleteAssetType(req, res, next) {
    try {
      await AssetTypeService.deleteAssetType(req.params.id);
      res.redirect('/asset-types?success=Asset type deleted successfully');
    } catch (err) {
      res.redirect(`/asset-types?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /asset-types/export
  static async exportAssetTypes(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await AssetTypeService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=asset-types-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /asset-types/import
  static async importAssetTypes(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await AssetTypeService.importCSV(csvText);
      res.redirect(`/asset-types?success=Successfully imported ${count} asset types.`);
    } catch (err) {
      res.redirect(`/asset-types?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = AssetTypeController;
