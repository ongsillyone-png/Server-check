const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'server_check',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  supportBigNumbers: true,
  bigNumberStrings: false,
  decimalNumbers: true
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Database connection pool established successfully.');
    conn.release();
  } catch (err) {
    console.error(err);
  }
})();

module.exports = pool;