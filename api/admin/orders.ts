// api/admin/orders.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = (req.headers.authorization || '') as string;
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { id, status, paymentStatus } = body as {
      id?: string;
      status?: string;
      paymentStatus?: string;
    };

    if (!id) return res.status(400).json({ error: 'Order id is required' });

    const sql = getDb();

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

    return res.status(200).json({ success: true, id, status, paymentStatus });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update order';
    return res.status(500).json({ error: errorMsg });
  }
}
