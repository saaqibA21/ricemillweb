import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let nodemailerStatus = 'untested';
  let nodemailerError = null;

  try {
    const nodemailer = await import('nodemailer');
    nodemailerStatus = typeof nodemailer.default?.createTransport || typeof (nodemailer as any).createTransport;
  } catch (e: any) {
    nodemailerStatus = 'failed';
    nodemailerError = e.message;
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
    nodemailerStatus,
    nodemailerError,
  });
}
