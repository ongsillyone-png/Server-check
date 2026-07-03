class Room {
  constructor(data) {
    this.id = data.id;
    this.room_name = data.room_name;
    this.floor = data.floor;
    this.building = data.building;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Validate Room attributes
   * @param {Object} data 
   * @returns {Array<string>} list of errors
   */
  static validate(data) {
    const errors = [];
    if (!data.room_name || !data.room_name.trim()) errors.push('Room name is required');
    if (!data.floor || !data.floor.trim()) errors.push('Floor is required');
    if (!data.building || !data.building.trim()) errors.push('Building is required');
    return errors;
  }
}

module.exports = Room;
