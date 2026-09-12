// api/admin/orders.ts
import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized: missing token' }, 401);
  }

  const url = process.env.DATABASE_URL;
  if (!url) return json({ error: 'DATABASE_URL not configured' }, 503);

  try {
    const { id, status, paymentStatus } = (await req.json()) as {
      id?: string;
      status?: string;
      paymentStatus?: string;
    };

    if (!id) return json({ error: 'Order id is required' }, 400);

    const sql = neon(url);

    if (status && paymentStatus) {
      await sql`
        update orders
        set status = ${status}, payment_status = ${paymentStatus}
        where id = ${id}
      `;
    } else if (status) {
      await sql`update orders set status = ${status} where id = ${id}`;
    } else if (paymentStatus) {
      await sql`update orders set payment_status = ${paymentStatus} where id = ${id}`;
    }

    return json({ success: true, id, status, paymentStatus });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update order';
    return json({ error: errorMsg }, 500);
  }
}
