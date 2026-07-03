class Role {
  constructor(data) {
    this.id = data.id;
    this.role_name = data.role_name;
    this.role_code = data.role_code;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.role_name || !data.role_name.trim()) errors.push('Role name is required');
    if (!data.role_code || !data.role_code.trim()) errors.push('Role code is required');
    return errors;
  }
}

module.exports = Role;
