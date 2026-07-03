const TemplateItemRepository = require('../repositories/template-item.repository');
const TemplateRepository = require('../repositories/template.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class TemplateItemService {
  static async getPagedTemplateItems(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await TemplateItemRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const items = await TemplateItemRepository.findAll(search, limitNum, offset);

    return {
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getTemplateItemDetails(id) {
    const item = await TemplateItemRepository.findById(id);
    if (!item) throw new Error('Inspection template item not found');
    return item;
  }

  static async createTemplateItem(data) {
    if (!data.template_id) throw new Error('Template is required');
    if (!data.item_name || !data.item_name.trim()) throw new Error('Item name is required');
    if (!data.item_type) throw new Error('Item type is required');

    const template = await TemplateRepository.findById(data.template_id);
    if (!template) throw new Error('Selected template does not exist');

    return await TemplateItemRepository.create(data);
  }

  static async updateTemplateItem(id, data) {
    if (!data.template_id) throw new Error('Template is required');
    if (!data.item_name || !data.item_name.trim()) throw new Error('Item name is required');
    if (!data.item_type) throw new Error('Item type is required');

    await this.getTemplateItemDetails(id);

    const template = await TemplateRepository.findById(data.template_id);
    if (!template) throw new Error('Selected template does not exist');

    return await TemplateItemRepository.update(id, data);
  }

  static async deleteTemplateItem(id) {
    await this.getTemplateItemDetails(id);
    return await TemplateItemRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    const tIdIdx = headers.indexOf('template_id');
    const nameIdx = headers.indexOf('item_name');
    const descIdx = headers.indexOf('description');
    const typeIdx = headers.indexOf('item_type');
    const sortIdx = headers.indexOf('sort_order');
    const activeIdx = headers.indexOf('is_active');

    if (tIdIdx === -1 || nameIdx === -1) {
      throw new Error('CSV header must contain "template_id" and "item_name" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;

      const itemData = {
        template_id: parseInt(row[tIdIdx]?.trim()),
        item_name: row[nameIdx]?.trim(),
        description: descIdx !== -1 ? row[descIdx]?.trim() : '',
        item_type: typeIdx !== -1 ? row[typeIdx]?.trim().toLowerCase() : 'boolean',
        sort_order: sortIdx !== -1 ? parseInt(row[sortIdx]?.trim() || '0') : 0,
        is_active: activeIdx !== -1 ? parseInt(row[activeIdx]?.trim() || '1') : 1
      };

      if (!isNaN(itemData.template_id) && itemData.item_name) {
        try {
          const template = await TemplateRepository.findById(itemData.template_id);
          if (template) {
            await TemplateItemRepository.create(itemData);
            successCount++;
          }
        } catch (err) {
          // ignore row errors
        }
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await TemplateItemRepository.countAll(search);
    const items = await TemplateItemRepository.findAll(search, totalRecords || 1, 0);
    const headerMapping = ['id', 'template_id', 'template_name', 'item_name', 'description', 'item_type', 'sort_order', 'is_active', 'created_at'];
    return generateCSV(items, headerMapping);
  }
}

module.exports = TemplateItemService;
