const UserService = require('../services/user.service');
const RoleRepository = require('../repositories/role.repository');

class UserController {
  // GET /users
  static async listUsers(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await UserService.getPagedUsers(search, page, limit);
      const roles = await RoleRepository.findAll('', 1000, 0);

      res.render('user/index', {
        title: 'User Management - Server Check',
        currentPage: 'users', // Highlighting users in some context, let's say sidebar has settings/users
        users: result.data,
        roles,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /users
  static async createUser(req, res, next) {
    try {
      await UserService.createUser(req.body);
      res.redirect('/users?success=User created successfully');
    } catch (err) {
      res.redirect(`/users?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /users/:id/update
  static async updateUser(req, res, next) {
    try {
      await UserService.updateUser(req.params.id, req.body);
      res.redirect('/users?success=User updated successfully');
    } catch (err) {
      res.redirect(`/users?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /users/:id/delete
  static async deleteUser(req, res, next) {
    try {
      await UserService.deleteUser(req.params.id);
      res.redirect('/users?success=User deleted successfully');
    } catch (err) {
      res.redirect(`/users?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /users/export
  static async exportUsers(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await UserService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /users/import
  static async importUsers(req, res, next) {
    try {
      if (!req.file) throw new Error('Please upload a CSV file.');
      const csvText = req.file.buffer.toString('utf-8');
      const count = await UserService.importCSV(csvText);
      res.redirect(`/users?success=Successfully imported ${count} users.`);
    } catch (err) {
      res.redirect(`/users?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = UserController;
