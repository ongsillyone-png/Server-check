const AssetTypeRepository = require('../repositories/asset-type.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class AssetTypeService {
  static async getPagedAssetTypes(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await AssetTypeRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const types = await AssetTypeRepository.findAll(search, limitNum, offset);

    return {
      data: types,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getAssetTypeDetails(id) {
    const type = await AssetTypeRepository.findById(id);
    if (!type) throw new Error('Asset type not found');
    return type;
  }

  static async createAssetType(data) {
    if (!data.type_name || !data.type_name.trim()) throw new Error('Type name is required');
    return await AssetTypeRepository.create(data);
  }

  static async updateAssetType(id, data) {
    if (!data.type_name || !data.type_name.trim()) throw new Error('Type name is required');
    await this.getAssetTypeDetails(id);
    return await AssetTypeRepository.update(id, data);
  }

  static async deleteAssetType(id) {
    await this.getAssetTypeDetails(id);
    return await AssetTypeRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('type_name');
    const descIdx = headers.indexOf('description');

    if (nameIdx === -1) throw new Error('CSV header must contain "type_name" column.');

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 1) continue;

      const typeData = {
        type_name: row[nameIdx]?.trim(),
        description: descIdx !== -1 ? row[descIdx]?.trim() : ''
      };

      if (typeData.type_name) {
        try {
          await AssetTypeRepository.create(typeData);
          successCount++;
        } catch (err) {
          // ignore row on database duplication error
        }
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await AssetTypeRepository.countAll(search);
    const types = await AssetTypeRepository.findAll(search, totalRecords || 1, 0);
    const headerMapping = ['id', 'type_name', 'description', 'created_at'];
    return generateCSV(types, headerMapping);
  }
}

module.exports = AssetTypeService;
