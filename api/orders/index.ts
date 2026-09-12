// api/orders/index.ts
// POST /api/orders -> create an order, returns { id, estimatedDelivery }
import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = process.env.DATABASE_URL;
  if (!url) return json({ error: 'DATABASE_URL is not set' }, 500);

  const body = (await req.json()) as {
    items: unknown;
    total: number;
    paymentMethod: 'upi' | 'cod';
    address: unknown;
  };
  const { items, total, paymentMethod, address } = body;

  if (!items || !total || !paymentMethod || !address) {
    return json({ error: 'Missing required order fields' }, 400);
  }

  const sql = neon(url);
  const id = `ORD${Date.now()}`;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid';

  await sql`
    insert into orders (id, items, total, status, payment_method, payment_status, address, estimated_delivery)
    values (
      ${id}, ${JSON.stringify(items)}, ${total}, 'confirmed',
      ${paymentMethod}, ${paymentStatus}, ${JSON.stringify(address)}, ${estimatedDelivery}
    )
  `;

  return json({ id, estimatedDelivery }, 201);
}
