const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path'):

dotenv.config();

async function initializeUsers() {
  let connection;
  try {
    // Create connection to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3333,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecommerce_db',
      ssl : {
        ca: fs.readFileSync(path.resolve(__dirname, 'ca.pem'))
      },
    });

    console.log('✅ Connected to database');

    // Check if accounts table is empty and create a super admin if so
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM accounts');
    if (rows[0].count === 0) {
      console.log('No accounts found, creating default super admin...');
      const username = 'abdelali';
      const email = 'aliaribi47@gmail.com';
      const password = 'abdelali47'; // You should change this
      const role = 'super';

      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query(
        'INSERT INTO accounts (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role]
      );
      console.log('✅ Default super admin created successfully');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('✅ Accounts already exist in the database');
    }

  } catch (error) {
    console.error('❌ Error initializing users:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeUsers()
  .then(() => {
    console.log('✅ User initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ User initialization failed:', error);
    process.exit(1);
  }); 