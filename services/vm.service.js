const VmRepository = require('../repositories/vm.repository');
const ServerRepository = require('../repositories/server.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');

class VmService {
  static async getPagedVms(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await VmRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const vms = await VmRepository.findAll(search, limitNum, offset);

    return {
      data: vms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getVmDetails(id) {
    const vm = await VmRepository.findById(id);
    if (!vm) throw new Error('Virtual machine not found');
    return vm;
  }

  static async createVm(data) {
    if (!data.physical_server_id) throw new Error('Physical Host Server is required');
    if (!data.vm_name || !data.vm_name.trim()) throw new Error('VM Name is required');

    const server = await ServerRepository.findById(data.physical_server_id);
    if (!server) throw new Error('Selected physical host server does not exist');

    return await VmRepository.create(data);
  }

  static async updateVm(id, data) {
    if (!data.physical_server_id) throw new Error('Physical Host Server is required');
    if (!data.vm_name || !data.vm_name.trim()) throw new Error('VM Name is required');

    await this.getVmDetails(id);

    const server = await ServerRepository.findById(data.physical_server_id);
    if (!server) throw new Error('Selected physical host server does not exist');

    return await VmRepository.update(id, data);
  }

  static async deleteVm(id) {
    await this.getVmDetails(id);
    return await VmRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    const psIdIdx = headers.indexOf('physical_server_id');
    const nameIdx = headers.indexOf('vm_name');
    const ipIdx = headers.indexOf('ip_address');
    const osIdx = headers.indexOf('os_type');
    const descIdx = headers.indexOf('description');
    const statusIdx = headers.indexOf('status');

    if (psIdIdx === -1 || nameIdx === -1) {
      throw new Error('CSV header must contain "physical_server_id" and "vm_name" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue;

      const vmData = {
        physical_server_id: parseInt(row[psIdIdx]?.trim()),
        vm_name: row[nameIdx]?.trim(),
        ip_address: ipIdx !== -1 ? row[ipIdx]?.trim() : '',
        os_type: osIdx !== -1 ? row[osIdx]?.trim() : '',
        description: descIdx !== -1 ? row[descIdx]?.trim() : '',
        status: statusIdx !== -1 ? row[statusIdx]?.trim().toLowerCase() : 'running'
      };

      if (!isNaN(vmData.physical_server_id) && vmData.vm_name) {
        try {
          const host = await ServerRepository.findById(vmData.physical_server_id);
          if (host) {
            await VmRepository.create(vmData);
            successCount++;
          }
        } catch (err) {
          // ignore row error
        }
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await VmRepository.countAll(search);
    const vms = await VmRepository.findAll(search, totalRecords || 1, 0);
    const headerMapping = ['id', 'physical_server_id', 'physical_server_name', 'vm_name', 'ip_address', 'os_type', 'description', 'status', 'created_at'];
    return generateCSV(vms, headerMapping);
  }
}

module.exports = VmService;
