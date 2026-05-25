const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
  process.exit(1);
});

const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Query executed:', { text, duration: `${duration}ms`, rows: result.rowCount });
  return result;
};

const getClient = async () => {
  const client = await pool.connect();
  const originalRelease = client.release.bind(client);

  client.release = () => {
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
};

module.exports = { query, getClient, pool };