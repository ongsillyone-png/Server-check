class InspectionTemplate {
  constructor(data) {
    this.id = data.id;
    this.template_name = data.template_name;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static validate(data) {
    const errors = [];
    if (!data.template_name || !data.template_name.trim()) errors.push('Template name is required');
    return errors;
  }
}

module.exports = InspectionTemplate;
