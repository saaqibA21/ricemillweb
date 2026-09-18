// api/admin/test-email.ts
// POST /api/admin/test-email -> verify SMTP configuration and send a test message
import { sendEmailMessage } from '../_lib/email';

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
  if (method !== 'POST') {
    return sendResponse(res, { error: 'Method not allowed' }, 405);
  }

  try {
    const body = await getRequestBody(req);
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
      return sendResponse(res, {
        error: 'Failed to send test email. Please check your SMTP credentials in Vercel environment variables.',
      }, 500);
    }

    return sendResponse(res, {
      success: true,
      message: `Test email sent successfully to ${targetEmail}`,
      result: testResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error sending test email';
    return sendResponse(res, { error: message }, 500);
  }
}
