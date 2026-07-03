const RoleService = require('../services/role.service');

class RoleController {
  // GET /roles
  static async listRoles(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await RoleService.getPagedRoles(search, page, limit);

      res.render('role/index', {
        title: 'Role Management - Server Check',
        currentPage: 'users',
        roles: result.data,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /roles
  static async createRole(req, res, next) {
    try {
      await RoleService.createRole(req.body);
      res.redirect('/roles?success=Role created successfully');
    } catch (err) {
      res.redirect(`/roles?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /roles/:id/update
  static async updateRole(req, res, next) {
    try {
      await RoleService.updateRole(req.params.id, req.body);
      res.redirect('/roles?success=Role updated successfully');
    } catch (err) {
      res.redirect(`/roles?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /roles/:id/delete
  static async deleteRole(req, res, next) {
    try {
      await RoleService.deleteRole(req.params.id);
      res.redirect('/roles?success=Role deleted successfully');
    } catch (err) {
      res.redirect(`/roles?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /roles/export
  static async exportRoles(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await RoleService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=roles-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /roles/import
  static async importRoles(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await RoleService.importCSV(csvText);
      res.redirect(`/roles?success=Successfully imported ${count} roles.`);
    } catch (err) {
      res.redirect(`/roles?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = RoleController;
