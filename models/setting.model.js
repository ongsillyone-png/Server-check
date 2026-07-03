class Setting {
  constructor(data) {
    this.id = data.id;
    this.setting_key = data.setting_key;
    this.setting_value = data.setting_value;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.setting_key || !data.setting_key.trim()) errors.push('Setting key is required');
    if (!data.setting_value || !data.setting_value.trim()) errors.push('Setting value is required');
    return errors;
  }
}

module.exports = Setting;
