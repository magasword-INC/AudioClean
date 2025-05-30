const { pool } = require('./db');

const createUsersTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'free' NOT NULL, -- 'free' or 'premium'
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Users table created successfully or already exists.');
  } catch (err) {
    console.error('Error creating users table:', err);
    throw err;
  }
};

const initializeDatabase = async () => {
  try {
    await createUsersTable();
    // Add more table creation functions here if needed in the future
    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  } finally {
    await pool.end(); // Close the pool after script execution
  }
};

initializeDatabase();
