require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log('Running migrations...');

    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get list of already executed migrations
    const executed = await client.query('SELECT filename FROM migrations');
    const executedFiles = executed.rows.map((r) => r.filename);

    // Read all .sql files in migrations folder
    const migrationsDir = path.join(__dirname);
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Run each migration that hasn't been executed yet
    for (const file of files) {
      if (executedFiles.includes(file)) {
        console.log(`  ✓ Already executed: ${file}`);
        continue;
      }

      console.log(`  → Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✓ Completed: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✗ Failed: ${file}`, err.message);
        throw err;
      }
    }

    console.log('All migrations completed successfully');
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});