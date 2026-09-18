import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let emailLibError = null;
  let emailLibLoaded = false;
  let testSendResult = null;
  let testSendError = null;

  try {
    const emailMod = await import('./_lib/email');
    emailLibLoaded = true;

    if (emailMod.sendEmailMessage) {
      try {
        testSendResult = await emailMod.sendEmailMessage({
          to: ['hariharantradersorders@gmail.com'],
          subject: '🌾 Live SMTP Diagnostic: Hariharan Traders',
          html: '<p>Live SMTP test via Vercel Serverless Function</p>',
        });
      } catch (err: any) {
        testSendError = { message: err.message, stack: err.stack };
      }
    }
  } catch (e: any) {
    emailLibError = {
      message: e.message,
      code: e.code,
      stack: e.stack,
    };
  }

  res.status(200).json({
    ok: true,
    emailLibLoaded,
    emailLibError,
    testSendResult,
    testSendError,
  });
}
