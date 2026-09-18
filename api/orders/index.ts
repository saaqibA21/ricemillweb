// api/orders/index.ts
// POST /api/orders -> create an order, returns { id, estimatedDelivery }
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { sendOrderConfirmationEmail } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.DATABASE_URL;
  if (!url) return res.status(500).json({ error: 'DATABASE_URL is not set' });

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as {
      items: Array<{
        product: { name: string };
        selectedWeight: { weight: string; price: number };
        quantity: number;
      }>;
      total: number;
      paymentMethod: 'upi' | 'cod';
      address: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        phone?: string;
        email?: string;
        name?: string;
      };
    };

    const { items, total, paymentMethod, address } = body;

    if (!items || !total || !paymentMethod || !address) {
      return res.status(400).json({ error: 'Missing required order fields' });
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

    // Trigger automated order confirmation email asynchronously
    sendOrderConfirmationEmail({
      id,
      items,
      total,
      paymentMethod,
      address,
      estimatedDelivery,
    }).catch((err) => console.warn('Order email dispatch warning:', err));

    return res.status(201).json({ id, estimatedDelivery });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return res.status(500).json({ error: message });
  }
}
