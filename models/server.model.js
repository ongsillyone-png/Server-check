class Server {
  constructor(data) {
    this.id = data.id;
    this.rack_id = data.rack_id;
    this.asset_type_id = data.asset_type_id;
    this.server_name = data.server_name;
    this.model = data.model;
    this.serial_number = data.serial_number;
    this.ip_address = data.ip_address;
    this.asset_number = data.asset_number;
    this.rack_position_u = data.rack_position_u;
    this.description = data.description;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.rack_id || isNaN(data.rack_id)) errors.push('Rack is required');
    if (!data.asset_type_id || isNaN(data.asset_type_id)) errors.push('Asset type is required');
    if (!data.server_name || !data.server_name.trim()) errors.push('Server name is required');
    if (data.ip_address && !/^(\d{1,3}\.){3}\d{1,3}$/.test(data.ip_address.trim())) {
      // Optional basic IP format validation if entered
      errors.push('IP Address format is invalid');
    }
    return errors;
  }
}

module.exports = Server;
