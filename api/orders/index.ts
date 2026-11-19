// api/orders/index.ts
// POST /api/orders -> create an order, returns { id, estimatedDelivery }
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { sendOrderConfirmationEmail } from '../_lib/email.js';

function safeParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'string') {
        try {
          return JSON.parse(parsed) as T;
        } catch {
          return parsed as unknown as T;
        }
      }
      return parsed as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { id, phone } = req.query as { id?: string; phone?: string };
      if (!id && !phone) {
        return res.status(400).json({ error: 'Missing order id or phone parameter' });
      }

      const sql = getDb();

      if (id) {
        const rows = await sql`select * from orders where id = ${id} limit 1`;
        if (!rows || rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }
        const r = rows[0] as any;
        const address = safeParse<any>(r.address, {});
        return res.status(200).json({
          id: r.id,
          items: safeParse<any[]>(r.items, []),
          total: Number(r.total),
          status: r.status,
          paymentStatus: r.payment_status,
          paymentMethod: r.payment_method,
          address: {
            ...address,
            fullName: address.receiverName || address.fullName || 'Customer',
            phone: address.receiverPhone || address.phone || '',
          },
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
        const formatted = (rows as any[]).map((r) => {
          const address = safeParse<any>(r.address, {});
          return {
            id: r.id,
            items: safeParse<any[]>(r.items, []),
            total: Number(r.total),
            status: r.status,
            paymentStatus: r.payment_status,
            paymentMethod: r.payment_method,
            address: {
              ...address,
              fullName: address.receiverName || address.fullName || 'Customer',
              phone: address.receiverPhone || address.phone || '',
            },
            createdAt: r.created_at,
            estimatedDelivery: r.estimated_delivery,
          };
        });
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
        fullName?: string;
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

    const sql = getDb();
    const id = `ORD${Date.now()}`;
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid';

    const normalizedAddress = {
      ...address,
      fullName: address.receiverName || address.fullName || address.name || 'Customer',
      phone: address.receiverPhone || address.phone || '',
      email: address.receiverEmail || address.email || '',
    };

    try {
      await sql`
        insert into orders (id, items, total, status, payment_method, payment_status, address, estimated_delivery)
        values (
          ${id}, ${sql.json(items)}, ${total}, 'confirmed',
          ${paymentMethod}, ${paymentStatus}, ${sql.json(normalizedAddress)}, ${estimatedDelivery}
        )
      `;
    } catch (dbErr) {
      console.warn('Order DB insert error, proceeding with email confirmation:', dbErr);
    }

    // Always trigger automated order confirmation email asynchronously
    await sendOrderConfirmationEmail({
      id,
      items,
      total,
      paymentMethod,
      address: normalizedAddress,
      estimatedDelivery,
    }).catch((err) => console.warn('Order email dispatch warning:', err));

    return res.status(201).json({ id, estimatedDelivery });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return res.status(500).json({ error: message });
  }
}
