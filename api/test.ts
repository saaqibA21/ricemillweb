import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmailMessage } from './_lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let emailResult = null;
  let emailError = null;

  try {
    emailResult = await sendEmailMessage({
      to: ['hariharantradersorders@gmail.com'],
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
  } catch (err: any) {
    emailError = {
      message: err.message,
      stack: err.stack,
    };
  }

  res.status(200).json({
    status: 'ok',
    nodeVersion: process.version,
    env: {
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      hasDbUrl: !!process.env.DATABASE_URL,
    },
    emailResult,
    emailError,
  });
}
