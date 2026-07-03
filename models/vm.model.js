class VirtualMachine {
  constructor(data) {
    this.id = data.id;
    this.physical_server_id = data.physical_server_id;
    this.vm_name = data.vm_name;
    this.ip_address = data.ip_address;
    this.os_type = data.os_type;
    this.description = data.description;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.physical_server_id || isNaN(data.physical_server_id)) errors.push('Physical host server ID is required');
    if (!data.vm_name || !data.vm_name.trim()) errors.push('VM Name is required');
    return errors;
  }
}

module.exports = VirtualMachine;
