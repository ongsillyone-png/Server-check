const UserRepository = require('../repositories/user.repository');
const RoleRepository = require('../repositories/role.repository');
const { parseCSV, generateCSV } = require('../helpers/csv.helper');
const crypto = require('crypto');

class UserService {
  /**
   * Helper to hash password using Node.js built-in crypto module (SHA256)
   * @param {string} password 
   * @returns {string} hex hash
   */
  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  static async getPagedUsers(search = '', page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const totalRecords = await UserRepository.countAll(search);
    const totalPages = Math.ceil(totalRecords / limitNum);
    const users = await UserRepository.findAll(search, limitNum, offset);

    return {
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages
      }
    };
  }

  static async getUserDetails(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  static async createUser(data) {
    if (!data.username || !data.username.trim()) throw new Error('Username is required');
    if (!data.password || !data.password.trim()) throw new Error('Password is required');
    if (!data.role_id) throw new Error('Role is required');
    if (!data.name || !data.name.trim()) throw new Error('Full Name is required');
    if (!data.email || !data.email.trim()) throw new Error('Email is required');

    // Check Role existence
    const role = await RoleRepository.findById(data.role_id);
    if (!role) throw new Error('Selected role does not exist');

    // Hash the password
    const hashed = this.hashPassword(data.password);
    
    return await UserRepository.create({
      username: data.username.trim(),
      password_hash: hashed,
      role_id: data.role_id,
      name: data.name.trim(),
      email: data.email.trim(),
      is_active: data.is_active !== undefined ? data.is_active : 1
    });
  }

  static async updateUser(id, data) {
    if (!data.username || !data.username.trim()) throw new Error('Username is required');
    if (!data.role_id) throw new Error('Role is required');
    if (!data.name || !data.name.trim()) throw new Error('Full Name is required');
    if (!data.email || !data.email.trim()) throw new Error('Email is required');

    const existingUser = await this.getUserDetails(id);

    const role = await RoleRepository.findById(data.role_id);
    if (!role) throw new Error('Selected role does not exist');

    const updatePayload = {
      username: data.username.trim(),
      role_id: data.role_id,
      name: data.name.trim(),
      email: data.email.trim(),
      is_active: data.is_active !== undefined ? data.is_active : 1
    };

    // If new password is provided, hash and update it
    if (data.password && data.password.trim()) {
      updatePayload.password_hash = this.hashPassword(data.password);
    }

    return await UserRepository.update(id, updatePayload);
  }

  static async deleteUser(id) {
    await this.getUserDetails(id);
    return await UserRepository.delete(id);
  }

  static async importCSV(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('CSV is empty or missing headers');

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    const userIdx = headers.indexOf('username');
    const pwdIdx = headers.indexOf('password');
    const roleIdIdx = headers.indexOf('role_id');
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');
    const activeIdx = headers.indexOf('is_active');

    if (userIdx === -1 || pwdIdx === -1 || roleIdIdx === -1 || nameIdx === -1 || emailIdx === -1) {
      throw new Error('CSV header must contain "username", "password", "role_id", "name", and "email" columns.');
    }

    let successCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 5) continue;

      const rawPassword = row[pwdIdx]?.trim();
      const userData = {
        username: row[userIdx]?.trim(),
        password: rawPassword,
        role_id: parseInt(row[roleIdIdx]?.trim()),
        name: row[nameIdx]?.trim(),
        email: row[emailIdx]?.trim(),
        is_active: activeIdx !== -1 ? parseInt(row[activeIdx]?.trim() || '1') : 1
      };

      if (userData.username && userData.password && !isNaN(userData.role_id) && userData.name && userData.email) {
        try {
          const role = await RoleRepository.findById(userData.role_id);
          if (role) {
            await this.createUser(userData);
            successCount++;
          }
        } catch (err) {
          // ignore duplicate username errors
        }
      }
    }
    return successCount;
  }

  static async exportCSV(search = '') {
    const totalRecords = await UserRepository.countAll(search);
    const users = await UserRepository.findAll(search, totalRecords || 1, 0);
    // Exclude password hashes in reports for security
    const headerMapping = ['id', 'username', 'role_id', 'role_name', 'name', 'email', 'is_active', 'created_at'];
    return generateCSV(users, headerMapping);
  }
}

module.exports = UserService;
