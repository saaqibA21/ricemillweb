// api/_lib/db.ts
import postgres from 'postgres';

export const SUPABASE_URL =
  'postgresql://postgres.auviqeajkgtvnlsuofta:FAAZ_201912334@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

let _pgInstance: ReturnType<typeof postgres> | null = null;

export function getDb() {
  let url = process.env.DATABASE_URL || SUPABASE_URL;

  // If environment variable is pointing to the old quota-exceeded Neon endpoint, route to active Supabase
  if (!url || url.includes('ep-empty-lake-b30d8hxd')) {
    url = SUPABASE_URL;
  }

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
