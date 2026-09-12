// scripts/migrate.ts
// Usage: npm run db:migrate
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL not set. Run `vercel env pull .env.local` after creating the Postgres database in the Vercel dashboard, or add DATABASE_URL to .env.local'
    );
  }
  const sql = neon(url);
  const schemaPath = fileURLToPath(new URL('../db/schema.sql', import.meta.url));
  const schema = readFileSync(schemaPath, 'utf-8');
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
