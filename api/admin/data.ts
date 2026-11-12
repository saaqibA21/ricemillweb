// api/admin/data.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { sendEmailMessage } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = (req.headers.authorization || '') as string;
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  // Handle test email action
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const targetEmail = body.targetEmail || process.env.NOTIFICATION_EMAIL || 'hariharantradersorders@gmail.com';
      const testResult = await sendEmailMessage({
        to: [targetEmail],
        subject: '🌾 Live SMTP Verified: Hariharan Traders Rice',
        html: `
          <div style="font-family: Arial, sans-serif; background: #0f1a0f; color: #ffffff; padding: 25px;">
            <div style="max-width: 500px; margin: 0 auto; background: #1a2e1a; padding: 25px; border-radius: 12px; border: 1px solid #d4a017;">
              <h2 style="color: #d4a017; margin-top: 0;">✅ Gmail SMTP Live & Working!</h2>
              <p>Your live Vercel deployment for <strong>Hariharan Traders Rice</strong> is successfully connected to Gmail SMTP.</p>
              <p>Order confirmations and contact inquiries will now be delivered reliably.</p>
              <hr style="border: 0; border-top: 1px solid #2d4a2d; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8;">Sent via ${process.env.SMTP_USER || 'Gmail SMTP'} on ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
        `,
      });

      if (!testResult) {
        return res.status(500).json({ error: 'Failed to send test email. Please check your SMTP credentials in Vercel.' });
      }

      return res.status(200).json({ success: true, message: `Test email sent successfully to ${targetEmail}`, result: testResult });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error sending test email';
      return res.status(500).json({ error: message });
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getDb();

    const [orders, feedbacks, exportRequests] = await Promise.all([
      sql`select * from orders order by created_at desc`,
      sql`select * from feedbacks order by created_at desc`,
      sql`select * from export_requests order by created_at desc`,
    ]);

    // Compute metrics
    let totalRevenue = 0;
    let upiTotal = 0;
    let codTotal = 0;
    let pendingPaymentTotal = 0;
    let paidPaymentTotal = 0;

    let pendingOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let confirmedOrdersCount = 0;
    let upiCount = 0;
    let codCount = 0;
    let pendingPaymentsCount = 0;
    let paidPaymentsCount = 0;

    for (const o of orders as any[]) {
      const amt = Number(o.total) || 0;
      totalRevenue += amt;

      if (o.payment_method === 'upi') {
        upiCount++;
        upiTotal += amt;
      } else if (o.payment_method === 'cod') {
        codCount++;
        codTotal += amt;
      }

      if (o.payment_status === 'paid') {
        paidPaymentsCount++;
        paidPaymentTotal += amt;
      } else {
        pendingPaymentsCount++;
        pendingPaymentTotal += amt;
      }

      if (o.status === 'delivered') deliveredOrdersCount++;
      else if (o.status === 'confirmed') confirmedOrdersCount++;
      else pendingOrdersCount++;
    }

    return res.status(200).json({
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrdersCount,
        confirmedOrdersCount,
        deliveredOrdersCount,
        upiCount,
        upiTotal,
        codCount,
        codTotal,
        pendingPaymentsCount,
        pendingPaymentTotal,
        paidPaymentsCount,
        paidPaymentTotal,
        feedbacksCount: feedbacks.length,
        exportRequestsCount: exportRequests.length,
      },
      orders,
      feedbacks,
      exportRequests,
    });
  } catch (err: unknown) {
    console.warn('Admin data fetch warning (returning fallback data):', err);
    return res.status(200).json({
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrdersCount: 0,
        confirmedOrdersCount: 0,
        deliveredOrdersCount: 0,
        upiCount: 0,
        upiTotal: 0,
        codCount: 0,
        codTotal: 0,
        pendingPaymentsCount: 0,
        pendingPaymentTotal: 0,
        paidPaymentsCount: 0,
        paidPaymentTotal: 0,
        feedbacksCount: 0,
        exportRequestsCount: 0,
      },
      orders: [],
      feedbacks: [],
      exportRequests: [],
    });
  }
}
