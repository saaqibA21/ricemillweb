// api/admin/test-email.ts
// POST /api/admin/test-email -> verify SMTP configuration and send a test message
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmailMessage } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      return res.status(500).json({
        error: 'Failed to send test email. Please check your SMTP credentials in Vercel environment variables.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}`,
      result: testResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error sending test email';
    return res.status(500).json({ error: message });
  }
}
