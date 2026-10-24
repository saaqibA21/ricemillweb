// api/orders/index.ts
// POST /api/orders -> create an order, returns { id, estimatedDelivery }
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { sendOrderConfirmationEmail } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = process.env.DATABASE_URL;
  if (!url) return res.status(500).json({ error: 'DATABASE_URL is not set' });

  if (req.method === 'GET') {
    try {
      const { id, phone } = req.query as { id?: string; phone?: string };
      if (!id && !phone) {
        return res.status(400).json({ error: 'Missing order id or phone parameter' });
      }

      const sql = neon(url);

      if (id) {
        const rows = await sql`select * from orders where id = ${id} limit 1`;
        if (!rows || rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }
        const r = rows[0] as any;
        return res.status(200).json({
          id: r.id,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
          total: Number(r.total),
          status: r.status,
          paymentStatus: r.payment_status,
          paymentMethod: r.payment_method,
          address: typeof r.address === 'string' ? JSON.parse(r.address) : r.address,
          createdAt: r.created_at,
          estimatedDelivery: r.estimated_delivery,
        });
      }

      if (phone) {
        const sanitizedPhone = phone.replace(/\D/g, '').slice(-10);
        const rows = await sql`
          select * from orders 
          where address->>'receiverPhone' like ${'%' + sanitizedPhone} 
             or address->>'phone' like ${'%' + sanitizedPhone}
          order by created_at desc 
          limit 50
        `;
        const formatted = (rows as any[]).map((r) => ({
          id: r.id,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
          total: Number(r.total),
          status: r.status,
          paymentStatus: r.payment_status,
          paymentMethod: r.payment_method,
          address: typeof r.address === 'string' ? JSON.parse(r.address) : r.address,
          createdAt: r.created_at,
          estimatedDelivery: r.estimated_delivery,
        }));
        return res.status(200).json(formatted);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      return res.status(500).json({ error: message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as {
      items: Array<{
        product: { name: string };
        selectedWeight: { weight: string; price: number };
        quantity: number;
      }>;
      total: number;
      paymentMethod: 'upi' | 'cod' | 'razorpay';
      address: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        phone?: string;
        email?: string;
        name?: string;
        service?: string;
        branchId?: string;
        branchName?: string;
        branchAddress?: string;
        branchPhone?: string;
        branchDigiPin?: string;
        contactPerson?: string;
        receiverName?: string;
        receiverPhone?: string;
        receiverEmail?: string;
        alternatePhone?: string;
        razorpayPaymentId?: string;
        razorpayOrderId?: string;
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
    await sendOrderConfirmationEmail({
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
