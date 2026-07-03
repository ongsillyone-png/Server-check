const pool = require('../config/database');

class BaseRepository {
  /**
   * Helper function to execute raw SQL query safely with connection pool acquisition and release
   * @param {string} sql - SQL string to execute
   * @param {Array} params - Query arguments
   * @returns {Promise<any>} MariaDB result object
   */
  static async query(sql, params = []) {
    let conn;
    try {
      conn = await pool.getConnection();
      const res = await conn.query(sql, params);
      return res;
    } catch (err) {
      console.error(`Database Query Failed:\nSQL: ${sql}\nParams: ${JSON.stringify(params)}\nError:`, err.message);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }
}

module.exports = BaseRepository;
