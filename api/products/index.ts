// api/products/index.ts
// GET /api/products            -> all products
// GET /api/products?variety=X  -> products filtered by variety
import { db, mapProductRow, json } from '../_lib/products';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const sql = db();
  const variety = new URL(req.url).searchParams.get('variety');

  const rows = variety
    ? await sql`select * from products where variety = ${variety} order by created_at`
    : await sql`select * from products order by created_at`;

  return json(rows.map(mapProductRow));
}
