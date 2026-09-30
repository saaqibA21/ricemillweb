// api/verify-payment.ts
// POST /api/verify-payment -> verifies Razorpay payment signature
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key_secret = (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    process.env.RAZORPAY_SECRET_KEY ||
    'UL4gABm9WZpam9GpcVHMapsI'
  ).replace(/^["']|["']$/g, '').trim();

  if (!key_secret) {
    return res.status(500).json({ error: 'Razorpay secret key not configured on server' });
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      order_id?: string;
      payment_id?: string;
      signature?: string;
    };

    const orderId = body.razorpay_order_id || body.order_id;
    const paymentId = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: order_id, payment_id, and signature are all required',
        verified: false,
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(signature, 'utf-8');

    const isValid =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!isValid) {
      return res.status(400).json({
        error: 'Payment verification failed: Signature mismatch',
        verified: false,
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment signature verified successfully',
      orderId,
      paymentId,
    });
  } catch (err: any) {
    console.error('Razorpay verify-payment error:', err);
    return res.status(500).json({
      error: err?.message || 'Error verifying payment signature',
      verified: false,
    });
  }
}
