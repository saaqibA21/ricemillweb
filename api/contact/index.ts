// api/contact/index.ts
// POST /api/contact -> save customer feedback / inquiry
import { neon } from '@neondatabase/serverless';
import { sendContactFeedbackEmail } from '../_lib/email';

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
  if (!url) return sendResponse(res, { error: 'DATABASE_URL is not set' }, 503);

  try {
    const body = (await getRequestBody(req)) as {
      name?: string;
      phone?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    const { name, phone, email, subject, message } = body;

    if (!name || !email || !message) {
      return sendResponse(res, { error: 'Name, email, and message are required' }, 400);
    }

    const sql = neon(url);
    const id = `FB${Date.now()}`;

    await sql`
      insert into feedbacks (id, name, phone, email, subject, message)
      values (${id}, ${name}, ${phone || null}, ${email}, ${subject || null}, ${message})
    `;

    // Trigger automated notification email
    sendContactFeedbackEmail({
      name,
      phone,
      email,
      subject,
      message,
    }).catch((err) => console.warn('Feedback email dispatch warning:', err));

    return sendResponse(res, { success: true, id }, 201);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save feedback';
    return sendResponse(res, { error: errorMsg }, 500);
  }
}
