const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config();

async function initializeDatabase() {
  let connection;
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: 3333,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ecommerce_db'}`);
    console.log('✅ Database created or already exists');

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'ecommerce_db'}`);

    // Read and execute the SQL file
    const sqlFile = await fs.readFile(path.join(__dirname, '../database.sql'), 'utf8');
    const statements = sqlFile
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement + ';');

    for (const statement of statements) {
      await connection.query(statement);
    }

    // Check if accounts table is empty and create a super admin if so
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM accounts');
    if (rows[0].count === 0) {
      console.log('No accounts found, creating default super admin...');
      const username = 'admin';
      const email = 'admin@example.com';
      const password = 'admin'; // You should change this
      const role = 'super';

      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query(
        'INSERT INTO accounts (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role]
      );
      console.log('Default super admin created.');
    }

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }); 