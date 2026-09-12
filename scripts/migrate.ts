// scripts/migrate.ts
// Usage: npm run db:migrate
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL not set. Run `vercel env pull .env.local` after creating the Postgres database in the Vercel dashboard.'
    );
  }
  const sql = neon(url);
  const schema = readFileSync(join(__dirname, '../db/schema.sql'), 'utf-8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`Migration complete — ${statements.length} statements applied.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
