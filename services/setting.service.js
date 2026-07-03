const SettingRepository = require('../repositories/setting.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class SettingService {
  static async getPagedSettings(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await SettingRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const settings = await SettingRepository.findAll(search, limitNum, offset);

    return {
      data: settings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getSettingDetails(id) {
    const setting = await SettingRepository.findById(id);
    if (!setting) throw new Error('Setting not found');
    return setting;
  }

  static async createSetting(data) {
    if (!data.setting_key || !data.setting_key.trim()) throw new Error('Setting key is required');
    if (!data.setting_value || !data.setting_value.trim()) throw new Error('Setting value is required');
    return await SettingRepository.create(data);
  }

  static async updateSetting(id, data) {
    if (!data.setting_key || !data.setting_key.trim()) throw new Error('Setting key is required');
    if (!data.setting_value || !data.setting_value.trim()) throw new Error('Setting value is required');
    
    await this.getSettingDetails(id);
    return await SettingRepository.update(id, data);
  }

  static async deleteSetting(id) {
    await this.getSettingDetails(id);
    return await SettingRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const keyIdx = headers.indexOf('setting_key');
    const valIdx = headers.indexOf('setting_value');
    const descIdx = headers.indexOf('description');

    if (keyIdx === -1 || valIdx === -1) {
      throw new Error('CSV header must contain "setting_key" and "setting_value" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;

      const settingData = {
        setting_key: row[keyIdx]?.trim(),
        setting_value: row[valIdx]?.trim(),
        description: descIdx !== -1 ? row[descIdx]?.trim() : ''
      };

      if (settingData.setting_key && settingData.setting_value) {
        try {
          await SettingRepository.create(settingData);
          successCount++;
        } catch (err) {
          // ignore duplicate setting key errors
        }
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await SettingRepository.countAll(search);
    const settings = await SettingRepository.findAll(search, totalRecords || 1, 0);
    const headerMapping = ['id', 'setting_key', 'setting_value', 'description', 'created_at'];
    return generateCSV(settings, headerMapping);
  }
}

module.exports = SettingService;
