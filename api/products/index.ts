// api/products/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, mapProductRow } from '../_lib/products';
import { products as defaultProducts } from '../../src/data/products';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const variety = req.query.variety as string | undefined;

  try {
    const sql = db();
    const rows = variety
      ? await sql`select * from products where variety = ${variety} order by created_at`
      : await sql`select * from products order by created_at`;

    if (rows && rows.length > 0) {
      return res.status(200).json(rows.map(mapProductRow));
    }
  } catch (err: unknown) {
    console.warn('Database error in products handler, falling back to static catalog:', err);
  }

  const filtered = variety
    ? defaultProducts.filter((p) => p.variety.toLowerCase() === variety.toLowerCase())
    : defaultProducts;

  return res.status(200).json(filtered);
}
