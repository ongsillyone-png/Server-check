class AssetType {
  constructor(data) {
    this.id = data.id;
    this.type_name = data.type_name;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.type_name || !data.type_name.trim()) errors.push('Asset type name is required');
    return errors;
  }
}

module.exports = AssetType;
