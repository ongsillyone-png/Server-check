const VmService = require('../services/vm.service');
const ServerRepository = require('../repositories/server.repository');

class VmController {
  // GET /vms
  static async listVms(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await VmService.getPagedVms(search, page, limit);
      const hostServers = await ServerRepository.findAll('', 1000, 0);

      res.render('vm/index', {
        title: 'Virtual Machine Management - Server Check',
        currentPage: 'servers',
        vms: result.data,
        hostServers,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /vms
  static async createVm(req, res, next) {
    try {
      await VmService.createVm(req.body);
      res.redirect('/vms?success=Virtual machine created successfully');
    } catch (err) {
      res.redirect(`/vms?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /vms/:id/update
  static async updateVm(req, res, next) {
    try {
      await VmService.updateVm(req.params.id, req.body);
      res.redirect('/vms?success=Virtual machine updated successfully');
    } catch (err) {
      res.redirect(`/vms?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /vms/:id/delete
  static async deleteVm(req, res, next) {
    try {
      await VmService.deleteVm(req.params.id);
      res.redirect('/vms?success=Virtual machine deleted successfully');
    } catch (err) {
      res.redirect(`/vms?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /vms/export
  static async exportVms(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await VmService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vms-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /vms/import
  static async importVms(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await VmService.importCSV(csvText);
      res.redirect(`/vms?success=Successfully imported ${count} virtual machines.`);
    } catch (err) {
      res.redirect(`/vms?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = VmController;
