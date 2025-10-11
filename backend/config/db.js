const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const initializeDatabase = async () => {
  try {
    await promisePool.query('SELECT 1');
    console.log('Database connection successful');
    
      const [countResult] = await promisePool.query('SELECT COUNT(*) as count FROM users');
      console.log(`Current users in database: ${countResult[0].count}/1000`);
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = { pool: promisePool, initializeDatabase };