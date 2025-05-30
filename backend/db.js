const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // You might need to configure SSL for production environments:
    // ssl: {
    //   rejectUnauthorized: false // Or true, depending on your SSL certificate setup
    // }
  });
} else {
  // Fallback to individual environment variables or hardcoded values if DATABASE_URL is not set
  // This provides flexibility but using DATABASE_URL is generally preferred
  console.warn("DATABASE_URL not found, attempting to use individual DB env vars or defaults.");
  pool = new Pool({
    user: process.env.DB_USER || 'audiocleanuser',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'audiocleandb',
    password: process.env.DB_PASSWORD || 'audiocleanpassword',
    port: process.env.DB_PORT || 5432,
  });
}

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if needed for transactions or direct access
};
