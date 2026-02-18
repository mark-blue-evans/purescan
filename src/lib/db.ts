import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

export async function initializeDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS scans (
      id SERIAL PRIMARY KEY,
      barcode VARCHAR(50),
      product_name TEXT,
      purity_score INTEGER,
      processing_level TEXT,
      ingredients JSONB,
      image_url TEXT,
      scanned_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS grocery_items (
      id SERIAL PRIMARY KEY,
      barcode VARCHAR(50),
      product_name TEXT,
      purity_score INTEGER,
      added_at TIMESTAMP DEFAULT NOW()
    );
  `;

  console.log('Database initialized');
}

export { sql };
