class Rack {
  constructor(data) {
    this.id = data.id;
    this.room_id = data.room_id;
    this.rack_name = data.rack_name;
    this.unit_size = data.unit_size;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.room_id || isNaN(data.room_id)) errors.push('Room ID is required and must be numeric');
    if (!data.rack_name || !data.rack_name.trim()) errors.push('Rack name is required');
    if (!data.unit_size || isNaN(data.unit_size) || parseInt(data.unit_size) <= 0) {
      errors.push('Unit size is required and must be a positive integer');
    }
    return errors;
  }
}

module.exports = Rack;
