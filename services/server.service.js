const ServerRepository = require('../repositories/server.repository');
const RackRepository = require('../repositories/rack.repository');
const AssetTypeRepository = require('../repositories/asset-type.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class ServerService {
  static async getPagedServers(filters = {}, page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await ServerRepository.countAll(filters);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const servers = await ServerRepository.findAll(filters, limitNum, offset);

    return {
      data: servers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getServerDetails(id) {
    const server = await ServerRepository.findById(id);
    if (!server) throw new Error('Physical server not found');
    return server;
  }

  static async createServer(data) {
    if (!data.rack_id) throw new Error('Rack is required');
    if (!data.asset_type_id) throw new Error('Asset Type is required');
    if (!data.server_name || !data.server_name.trim()) throw new Error('Server name is required');
    
    // Validate existence
    const rack = await RackRepository.findById(data.rack_id);
    if (!rack) throw new Error('Selected rack does not exist');

    const type = await AssetTypeRepository.findById(data.asset_type_id);
    if (!type) throw new Error('Selected asset type does not exist');

    return await ServerRepository.create(data);
  }

  static async updateServer(id, data) {
    if (!data.rack_id) throw new Error('Rack is required');
    if (!data.asset_type_id) throw new Error('Asset Type is required');
    if (!data.server_name || !data.server_name.trim()) throw new Error('Server name is required');

    await this.getServerDetails(id);

    const rack = await RackRepository.findById(data.rack_id);
    if (!rack) throw new Error('Selected rack does not exist');

    const type = await AssetTypeRepository.findById(data.asset_type_id);
    if (!type) throw new Error('Selected asset type does not exist');

    return await ServerRepository.update(id, data);
  }

  static async deleteServer(id) {
    await this.getServerDetails(id);
    return await ServerRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    const rackIdIdx = headers.indexOf('rack_id');
    const atIdIdx = headers.indexOf('asset_type_id');
    const nameIdx = headers.indexOf('server_name');
    const modelIdx = headers.indexOf('model');
    const serialIdx = headers.indexOf('serial_number');
    const ipIdx = headers.indexOf('ip_address');
    const assetNumIdx = headers.indexOf('asset_number');
    const posIdx = headers.indexOf('rack_position_u');
    const descIdx = headers.indexOf('description');
    const statusIdx = headers.indexOf('status');

    if (rackIdIdx === -1 || atIdIdx === -1 || nameIdx === -1) {
      throw new Error('CSV header must contain "rack_id", "asset_type_id", and "server_name" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue;

      const serverData = {
        rack_id: parseInt(row[rackIdIdx]?.trim()),
        asset_type_id: parseInt(row[atIdIdx]?.trim()),
        server_name: row[nameIdx]?.trim(),
        model: modelIdx !== -1 ? row[modelIdx]?.trim() : '',
        serial_number: serialIdx !== -1 ? row[serialIdx]?.trim() : '',
        ip_address: ipIdx !== -1 ? row[ipIdx]?.trim() : '',
        asset_number: assetNumIdx !== -1 ? row[assetNumIdx]?.trim() : '',
        rack_position_u: posIdx !== -1 ? parseInt(row[posIdx]?.trim() || '1') : null,
        description: descIdx !== -1 ? row[descIdx]?.trim() : '',
        status: statusIdx !== -1 ? row[statusIdx]?.trim().toLowerCase() : 'active'
      };

      if (!isNaN(serverData.rack_id) && !isNaN(serverData.asset_type_id) && serverData.server_name) {
        try {
          const rack = await RackRepository.findById(serverData.rack_id);
          const type = await AssetTypeRepository.findById(serverData.asset_type_id);
          if (rack && type) {
            await ServerRepository.create(serverData);
            successCount++;
          }
        } catch (err) {
          // ignore duplicate entry serials or foreign keys failures
        }
      }
    }
    return successCount;
  }

  static async exportCSV(filters = {}) {
    const totalRecords = await ServerRepository.countAll(filters);
    const servers = await ServerRepository.findAll(filters, totalRecords || 1, 0);
    const headerMapping = [
      'id', 'rack_id', 'rack_name', 'room_name', 'asset_type_id', 'type_name', 
      'server_name', 'model', 'serial_number', 'ip_address', 'asset_number', 
      'rack_position_u', 'description', 'status', 'created_at'
    ];
    return generateCSV(servers, headerMapping);
  }
}

module.exports = ServerService;
