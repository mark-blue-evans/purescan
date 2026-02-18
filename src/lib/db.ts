import { neon } from '@neondatabase/serverless';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlInstance: any = null;

function getSql() {
  if (!process.env.NEON_DATABASE_URL) {
    console.warn('NEON_DATABASE_URL not set - database operations will fail');
    return null;
  }
  return neon(process.env.NEON_DATABASE_URL);
}

function getSqlInstance() {
  if (!sqlInstance) {
    sqlInstance = getSql();
  }
  return sqlInstance;
}

export async function initializeDb() {
  const db = getSqlInstance();
  if (!db) {
    console.warn('Cannot initialize DB - no connection string');
    return;
  }

  // Create tables if they don't exist
  try {
    await db`CREATE TABLE IF NOT EXISTS scans (id SERIAL PRIMARY KEY, barcode VARCHAR(50), product_name TEXT, purity_score INTEGER, processing_level TEXT, ingredients JSONB, image_url TEXT, scanned_at TIMESTAMP DEFAULT NOW())`;
  } catch (e) {
    // Table might already exist
  }

  try {
    await db`CREATE TABLE IF NOT EXISTS grocery_items (id SERIAL PRIMARY KEY, barcode VARCHAR(50), product_name TEXT, purity_score INTEGER, added_at TIMESTAMP DEFAULT NOW())`;
  } catch (e) {
    // Table might already exist
  }

  console.log('Database initialized');
}

// Use tagged template directly via getSqlInstance
export const getDb = getSqlInstance;
