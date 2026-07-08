const ServerService = require('../services/server.service');
const RackRepository = require('../repositories/rack.repository');
const AssetTypeRepository = require('../repositories/asset-type.repository');
const RoomRepository = require('../repositories/room.repository');

class ServerController {
  // GET /servers
  static async listServers(req, res, next) {
    try {
      const search = req.query.search || '';
      const roomId = req.query.roomId || '';
      const rackId = req.query.rackId || '';
      const assetTypeId = req.query.assetTypeId || '';

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = { search, roomId, rackId, assetTypeId };
      const result = await ServerService.getPagedServers(filters, page, limit);

      const rooms = await RoomRepository.findAll('', 1000, 0);
      const racks = await RackRepository.findAll('', 1000, 0);
      const assetTypes = await AssetTypeRepository.findAll('', 1000, 0);

      res.render('server/index', {
        title: 'Physical Server Management - Server Check',
        currentPage: 'servers',
        servers: result.data,
        rooms,
        racks,
        assetTypes,
        pagination: result.pagination,
        search,
        roomId,
        rackId,
        assetTypeId,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /servers
  static async createServer(req, res, next) {
    try {
      await ServerService.createServer(req.body);
      res.redirect('/servers?success=Server registered successfully');
    } catch (err) {
      res.redirect(`/servers?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /servers/:id/update
  static async updateServer(req, res, next) {
    try {
      await ServerService.updateServer(req.params.id, req.body);
      res.redirect('/servers?success=Server updated successfully');
    } catch (err) {
      res.redirect(`/servers?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /servers/:id/delete
  static async deleteServer(req, res, next) {
    try {
      await ServerService.deleteServer(req.params.id);
      res.redirect('/servers?success=Server deleted successfully');
    } catch (err) {
      res.redirect(`/servers?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /servers/export
  static async exportServers(req, res, next) {
    try {
      const search = req.query.search || '';
      const roomId = req.query.roomId || '';
      const rackId = req.query.rackId || '';
      const assetTypeId = req.query.assetTypeId || '';

      const filters = { search, roomId, rackId, assetTypeId };
      const csvContent = await ServerService.exportCSV(filters);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=servers-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /servers/import
  static async importServers(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await ServerService.importCSV(csvText);
      res.redirect(`/servers?success=Successfully imported ${count} physical servers.`);
    } catch (err) {
      res.redirect(`/servers?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = ServerController;
