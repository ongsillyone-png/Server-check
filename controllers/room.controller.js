const RoomService = require('../services/room.service');

class RoomController {
  // GET /rooms
  static async listRooms(req, res, next) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await RoomService.getPagedRooms(search, page, limit);

      res.render('room/index', {
        title: 'Room Management - Server Check',
        currentPage: 'rooms',
        rooms: result.data,
        pagination: result.pagination,
        search,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /rooms
  static async createRoom(req, res, next) {
    try {
      await RoomService.createRoom(req.body);
      res.redirect('/rooms?success=Room created successfully');
    } catch (err) {
      res.redirect(`/rooms?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /rooms/:id/update
  static async updateRoom(req, res, next) {
    try {
      await RoomService.updateRoom(req.params.id, req.body);
      res.redirect('/rooms?success=Room updated successfully');
    } catch (err) {
      res.redirect(`/rooms?error=${encodeURIComponent(err.message)}`);
    }
  }

  // POST /rooms/:id/delete
  static async deleteRoom(req, res, next) {
    try {
      await RoomService.deleteRoom(req.params.id);
      res.redirect('/rooms?success=Room deleted successfully');
    } catch (err) {
      res.redirect(`/rooms?error=${encodeURIComponent(err.message)}`);
    }
  }

  // GET /rooms/export
  static async exportRooms(req, res, next) {
    try {
      const search = req.query.search || '';
      const csvContent = await RoomService.exportCSV(search);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=rooms-export.csv');
      res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /rooms/import
  static async importRooms(req, res, next) {
    try {
      if (!req.file) {
        throw new Error('Please upload a CSV file.');
      }
      
      const csvText = req.file.buffer.toString('utf-8');
      const count = await RoomService.importCSV(csvText);
      
      res.redirect(`/rooms?success=Successfully imported ${count} rooms.`);
    } catch (err) {
      res.redirect(`/rooms?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = RoomController;
