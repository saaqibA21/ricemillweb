// api/products/[slug].ts
// GET /api/products/:slug -> a single product
import { db, mapProductRow, json } from '../_lib/products';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const slug = new URL(req.url).pathname.split('/').pop();
  const sql = db();
  const rows = await sql`select * from products where slug = ${slug} limit 1`;

  if (rows.length === 0) return json({ error: 'Not found' }, 404);
  return json(mapProductRow(rows[0]));
}
