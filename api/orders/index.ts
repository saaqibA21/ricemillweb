// api/orders/index.ts
// POST /api/orders -> create an order, returns { id, estimatedDelivery }
import { neon } from '@neondatabase/serverless';
import { sendOrderConfirmationEmail } from '../_lib/email';

export const config = { runtime: 'nodejs' };

async function getRequestBody(req: any) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  if (typeof req.json === 'function') {
    return await req.json().catch(() => ({}));
  }
  return {};
}

function sendResponse(res: any, data: any, status = 200) {
  if (res && typeof res.status === 'function') {
    return res.status(status).json(data);
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: any, res?: any) {
  const method = req.method || 'GET';
  if (method !== 'POST') return sendResponse(res, { error: 'Method not allowed' }, 405);

  const url = process.env.DATABASE_URL;
  if (!url) return sendResponse(res, { error: 'DATABASE_URL is not set' }, 500);

  try {
    const body = (await getRequestBody(req)) as {
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
      return sendResponse(res, { error: 'Missing required order fields' }, 400);
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

    return sendResponse(res, { id, estimatedDelivery }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return sendResponse(res, { error: message }, 500);
  }
}
