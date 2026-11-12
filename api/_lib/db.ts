// api/_lib/db.ts
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';

let _pgInstance: ReturnType<typeof postgres> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  // If Neon database is used
  if (url.includes('neon.tech')) {
    return neon(url);
  }

  // If Supabase or standard PostgreSQL is used
  if (!_pgInstance) {
    _pgInstance = postgres(url, {
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return _pgInstance;
}

export default getDb;
