const RackRepository = require('../repositories/rack.repository');
const RoomRepository = require('../repositories/room.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class RackService {
  static async getPagedRacks(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await RackRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const racks = await RackRepository.findAll(search, limitNum, offset);

    return {
      data: racks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getRackDetails(id) {
    const rack = await RackRepository.findById(id);
    if (!rack) throw new Error('Rack not found');
    return rack;
  }

  static async createRack(data) {
    if (!data.room_id) throw new Error('Room is required');
    if (!data.rack_name || !data.rack_name.trim()) throw new Error('Rack name is required');
    if (!data.unit_size || isNaN(data.unit_size)) throw new Error('Valid rack unit size (U) is required');

    // Confirm Room exists
    const room = await RoomRepository.findById(data.room_id);
    if (!room) throw new Error('Selected room does not exist');

    return await RackRepository.create(data);
  }

  static async updateRack(id, data) {
    if (!data.room_id) throw new Error('Room is required');
    if (!data.rack_name || !data.rack_name.trim()) throw new Error('Rack name is required');
    if (!data.unit_size || isNaN(data.unit_size)) throw new Error('Valid rack unit size (U) is required');

    await this.getRackDetails(id);
    
    const room = await RoomRepository.findById(data.room_id);
    if (!room) throw new Error('Selected room does not exist');

    return await RackRepository.update(id, data);
  }

  static async deleteRack(id) {
    await this.getRackDetails(id);
    return await RackRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const roomIdIdx = headers.indexOf('room_id');
    const nameIdx = headers.indexOf('rack_name');
    const sizeIdx = headers.indexOf('unit_size');
    const descIdx = headers.indexOf('description');

    if (roomIdIdx === -1 || nameIdx === -1 || sizeIdx === -1) {
      throw new Error('CSV header must contain "room_id", "rack_name", and "unit_size" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue;

      const rackData = {
        room_id: parseInt(row[roomIdIdx]?.trim()),
        rack_name: row[nameIdx]?.trim(),
        unit_size: parseInt(row[sizeIdx]?.trim() || '42'),
        description: descIdx !== -1 ? row[descIdx]?.trim() : ''
      };

      if (!isNaN(rackData.room_id) && rackData.rack_name && !isNaN(rackData.unit_size)) {
        try {
          const room = await RoomRepository.findById(rackData.room_id);
          if (room) {
            await RackRepository.create(rackData);
            successCount++;
          }
        } catch (err) {
          // ignore row on foreign key or general db error during batch import
        }
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await RackRepository.countAll(search);
    const racks = await RackRepository.findAll(search, totalRecords || 1, 0);
    const headerMapping = ['id', 'room_id', 'room_name', 'rack_name', 'unit_size', 'description', 'created_at'];
    return generateCSV(racks, headerMapping);
  }
}

module.exports = RackService;
