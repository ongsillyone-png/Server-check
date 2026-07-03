const TemplateRepository = require('../repositories/template.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class TemplateService {
  static async getPagedTemplates(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await TemplateRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const templates = await TemplateRepository.findAll(search, limitNum, offset);

    return {
      data: templates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getTemplateDetails(id) {
    const template = await TemplateRepository.findById(id);
    if (!template) throw new Error('Inspection template not found');
    return template;
  }

  static async createTemplate(data) {
    if (!data.template_name || !data.template_name.trim()) throw new Error('Template name is required');
    return await TemplateRepository.create(data);
  }

  static async updateTemplate(id, data) {
    if (!data.template_name || !data.template_name.trim()) throw new Error('Template name is required');
    await this.getTemplateDetails(id);
    return await TemplateRepository.update(id, data);
  }

  static async deleteTemplate(id) {
    await this.getTemplateDetails(id);
    return await TemplateRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('template_name');
    const activeIdx = headers.indexOf('is_active');

    if (nameIdx === -1) throw new Error('CSV header must contain "template_name" column.');

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 1) continue;

      const templateData = {
        template_name: row[nameIdx]?.trim(),
        is_active: activeIdx !== -1 ? parseInt(row[activeIdx]?.trim() || '1') : 1
      };

      if (templateData.template_name) {
        await TemplateRepository.create(templateData);
        successCount++;
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await TemplateRepository.countAll(search);
    const templates = await TemplateRepository.findAll(search, totalRecords || 1, 0);
    const headerMapping = ['id', 'template_name', 'is_active', 'created_at'];
    return generateCSV(templates, headerMapping);
  }
}

module.exports = TemplateService;
