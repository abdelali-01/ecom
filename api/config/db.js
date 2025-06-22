const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs')
const path = require('path');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port : process.env.DB_PORT || 3333,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  ssl : {
    ca: fs.readFileSync(path.resolve(__dirname, 'ca.pem'))
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Log query errors
pool.on('error', (err) => {
  console.error('❌ Database error:', err.message);
});

module.exports = pool; 