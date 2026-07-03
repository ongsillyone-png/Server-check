const RackService = require('../services/rack.service');
const RoomRepository = require('../repositories/room.repository');

class RackController {
  // GET /racks
  static async listRacks(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await RackService.getPagedRacks(search, page, limit);
      const rooms = await RoomRepository.findAll('', 1000, 0); // Load for dropdown

      res.render('rack/index', {
        title: 'Rack Management - Server Check',
        currentPage: 'racks',
        racks: result.data,
        rooms,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /racks
  static async createRack(req, res, next) {
    try {
      await RackService.createRack(req.body);
      res.redirect('/racks?success=Rack created successfully');
    } catch (err) {
      res.redirect(`/racks?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /racks/:id/update
  static async updateRack(req, res, next) {
    try {
      await RackService.updateRack(req.params.id, req.body);
      res.redirect('/racks?success=Rack updated successfully');
    } catch (err) {
      res.redirect(`/racks?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /racks/:id/delete
  static async deleteRack(req, res, next) {
    try {
      await RackService.deleteRack(req.params.id);
      res.redirect('/racks?success=Rack deleted successfully');
    } catch (err) {
      res.redirect(`/racks?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /racks/export
  static async exportRacks(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await RackService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=racks-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /racks/import
  static async importRacks(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await RackService.importCSV(csvText);
      res.redirect(`/racks?success=Successfully imported ${count} racks.`);
    } catch (err) {
      res.redirect(`/racks?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = RackController;
