const RoomRepository = require('../repositories/room.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class RoomService {
  static async getPagedRooms(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await RoomRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const rooms = await RoomRepository.findAll(search, limitNum, offset);

    return {
      data: rooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getRoomDetails(id) {
    const room = await RoomRepository.findById(id);
    if (!room) throw new Error('Room not found');
    return room;
  }

  static async createRoom(data) {
    // Basic validation
    if (!data.room_name || !data.room_name.trim()) throw new Error('Room name is required');
    if (!data.floor || !data.floor.trim()) throw new Error('Floor is required');
    if (!data.building || !data.building.trim()) throw new Error('Building is required');

    return await RoomRepository.create(data);
  }

  static async updateRoom(id, data) {
    if (!data.room_name || !data.room_name.trim()) throw new Error('Room name is required');
    if (!data.floor || !data.floor.trim()) throw new Error('Floor is required');
    if (!data.building || !data.building.trim()) throw new Error('Building is required');

    await this.getRoomDetails(id); // Check existence
    return await RoomRepository.update(id, data);
  }

  static async deleteRoom(id) {
    await this.getRoomDetails(id);
    return await RoomRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV file is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    // Header check
    const nameIndex = headers.indexOf('room_name');
    const floorIndex = headers.indexOf('floor');
    const bldIndex = headers.indexOf('building');
    const descIndex = headers.indexOf('description');

    if (nameIndex === -1 || floorIndex === -1 || bldIndex === -1) {
      throw new Error('CSV header must contain "room_name", "floor", and "building" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue; // skip malformed row

      const roomData = {
        room_name: row[nameIndex]?.trim(),
        floor: row[floorIndex]?.trim(),
        building: row[bldIndex]?.trim(),
        description: descIndex !== -1 ? row[descIndex]?.trim() : ''
      };

      if (roomData.room_name && roomData.floor && roomData.building) {
        await RoomRepository.create(roomData);
        successCount++;
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    // Retrieve all matches for export without pagination limit
    const totalRecords = await RoomRepository.countAll(search);
    const rooms = await RoomRepository.findAll(search, totalRecords || 1, 0);
    
    const headerMapping = ['id', 'room_name', 'floor', 'building', 'description', 'created_at'];
    return generateCSV(rooms, headerMapping);
  }
}

module.exports = RoomService;
