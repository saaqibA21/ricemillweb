// api/admin/test-email.ts
// POST /api/admin/test-email -> verify SMTP configuration and send a test message
import { sendEmailMessage } from '../_lib/email';

export const config = { runtime: 'nodejs' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as { targetEmail?: string };
    const targetEmail = body.targetEmail || process.env.NOTIFICATION_EMAIL || 'hariharantradersorders@gmail.com';

    const testResult = await sendEmailMessage({
      to: [targetEmail],
      subject: '🌾 Test Email: Hariharan Traders SMTP is Active!',
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f1a0f; color: #ffffff; padding: 25px;">
          <div style="max-width: 500px; margin: 0 auto; background: #1a2e1a; padding: 25px; border-radius: 12px; border: 1px solid #d4a017;">
            <h2 style="color: #d4a017;">✅ SMTP Connection Successful!</h2>
            <p>Your email service for <strong>Hariharan Traders Rice</strong> is properly configured.</p>
            <p>New orders, customer receipts, and feedback inquiries will arrive in this inbox.</p>
            <hr style="border: 0; border-top: 1px solid #2d4a2d; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">Sent from: ${process.env.SMTP_USER || 'Default Email Engine'}</p>
          </div>
        </div>
      `,
    });

    if (!testResult) {
      return json({
        error: 'Failed to send test email. Please check your SMTP credentials in Vercel environment variables.',
      }, 500);
    }

    return json({ success: true, message: `Test email sent to ${targetEmail}`, result: testResult });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error sending test email';
    return json({ error: message }, 500);
  }
}
