class TemplateItem {
  constructor(data) {
    this.id = data.id;
    this.template_id = data.template_id;
    this.item_name = data.item_name;
    this.description = data.description;
    this.item_type = data.item_type;
    this.sort_order = data.sort_order;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.template_id || isNaN(data.template_id)) errors.push('Template ID is required');
    if (!data.item_name || !data.item_name.trim()) errors.push('Item name is required');
    if (!data.item_type || !['boolean', 'numeric', 'text'].includes(data.item_type)) {
      errors.push('Item type must be either boolean, numeric, or text');
    }
    return errors;
  }
}

module.exports = TemplateItem;
