const mariadb = require('mariadb');
require('dotenv').config();

// Create connection pool to MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'server_check',
  connectionLimit: 10,
  connectTimeout: 10000
});

// Test database connection pool
pool.getConnection()
  .then(conn => {
    console.log('Database connection pool established successfully.');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MariaDB pool:', err.message);
  });

module.exports = pool;
