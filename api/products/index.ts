// api/products/index.ts
// GET /api/products            -> all products
// GET /api/products?variety=X  -> products filtered by variety
import { db, mapProductRow, json } from '../_lib/products';
import { products as defaultProducts } from '../../src/data/products';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const variety = new URL(req.url).searchParams.get('variety');

  try {
    const sql = db();
    const rows = variety
      ? await sql`select * from products where variety = ${variety} order by created_at`
      : await sql`select * from products order by created_at`;

    if (rows && rows.length > 0) {
      return json(rows.map(mapProductRow));
    }
  } catch (err: unknown) {
    console.warn('Database error or table missing, falling back to static catalog:', err);
  }

  // Fallback to static catalog if DB is empty or during migration
  const filtered = variety
    ? defaultProducts.filter((p) => p.variety.toLowerCase() === variety.toLowerCase())
    : defaultProducts;

  return json(filtered);
}
