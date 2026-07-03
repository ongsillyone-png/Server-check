const RoleRepository = require('../repositories/role.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class RoleService {
  static async getPagedRoles(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await RoleRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const roles = await RoleRepository.findAll(search, limitNum, offset);

    return {
      data: roles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getRoleDetails(id) {
    const role = await RoleRepository.findById(id);
    if (!role) throw new Error('Role not found');
    return role;
  }

  static async createRole(data) {
    if (!data.role_name || !data.role_name.trim()) throw new Error('Role name is required');
    if (!data.role_code || !data.role_code.trim()) throw new Error('Role code is required');
    return await RoleRepository.create(data);
  }

  static async updateRole(id, data) {
    if (!data.role_name || !data.role_name.trim()) throw new Error('Role name is required');
    if (!data.role_code || !data.role_code.trim()) throw new Error('Role code is required');
    
    await this.getRoleDetails(id);
    return await RoleRepository.update(id, data);
  }

  static async deleteRole(id) {
    await this.getRoleDetails(id);
    return await RoleRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('role_name');
    const codeIdx = headers.indexOf('role_code');
    const descIdx = headers.indexOf('description');

    if (nameIdx === -1 || codeIdx === -1) {
      throw new Error('CSV header must contain "role_name" and "role_code" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;

      const roleData = {
        role_name: row[nameIdx]?.trim(),
        role_code: row[codeIdx]?.trim(),
        description: descIdx !== -1 ? row[descIdx]?.trim() : ''
      };

      if (roleData.role_name && roleData.role_code) {
        try {
          await RoleRepository.create(roleData);
          successCount++;
        } catch (err) {
          // ignore database constraint or duplicate code errors
        }
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await RoleRepository.countAll(search);
    const roles = await RoleRepository.findAll(search, totalRecords || 1, 0);
    const headerMapping = ['id', 'role_name', 'role_code', 'description', 'created_at'];
    return generateCSV(roles, headerMapping);
  }
}

module.exports = RoleService;
