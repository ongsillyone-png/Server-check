class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.password_hash = data.password_hash;
    this.role_id = data.role_id;
    this.name = data.name;
    this.email = data.email;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data, isUpdate = false) {
    const errors = [];
    if (!data.username || !data.username.trim()) errors.push('Username is required');
    if (!isUpdate && (!data.password || !data.password.trim())) errors.push('Password is required');
    if (!data.role_id || isNaN(data.role_id)) errors.push('Role is required');
    if (!data.name || !data.name.trim()) errors.push('Name is required');
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.push('Valid Email is required');
    }
    return errors;
  }
}

module.exports = User;
