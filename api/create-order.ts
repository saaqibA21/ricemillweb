// api/create-order.ts
// POST /api/create-order -> creates a Razorpay order
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key_id = (
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_ID ||
    process.env.RAZORPAY_KEY ||
    'rzp_test_TrmpDad9rOaGFZ'
  ).replace(/^["']|["']$/g, '').trim();

  const key_secret = (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    process.env.RAZORPAY_SECRET_KEY ||
    'b9fg63fl6584T5RrZG8CzN4G'
  ).replace(/^["']|["']$/g, '').trim();

  console.log('Using Razorpay Key ID:', key_id ? key_id.substring(0, 14) + '...' : 'NONE');

  if (!key_id || !key_secret) {
    return res.status(500).json({ error: 'Razorpay credentials not configured on server' });
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as {
      amount?: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
    };

    const rawAmount = body.amount;
    if (rawAmount === undefined || rawAmount === null || typeof rawAmount !== 'number' || isNaN(rawAmount)) {
      return res.status(400).json({ error: 'Invalid or missing amount' });
    }

    // Minimum amount: 100 paise (₹1.00)
    const amountInPaise = Math.round(rawAmount);
    if (amountInPaise < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise (₹1.00)' });
    }

    const currency = body.currency || 'INR';
    const receipt = body.receipt || `rcpt_${Date.now()}`;

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: body.notes || {},
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err: any) {
    console.error('Razorpay create-order error:', err);
    if (
      err?.statusCode === 401 ||
      (err?.error?.code === 'BAD_REQUEST_ERROR' && String(err?.message || '').toLowerCase().includes('auth'))
    ) {
      return res.status(401).json({
        error: `Razorpay authentication failed for Key ID: ${key_id.substring(0, 15)}... Check that your Key ID and Key Secret match the active keys in Razorpay Dashboard.`,
        key_id_prefix: key_id.substring(0, 15)
      });
    }
    return res.status(500).json({
      error: err?.error?.description || err?.message || 'Failed to create Razorpay order',
    });
  }
}
