// api/contact/index.ts
// POST /api/contact -> save customer feedback / inquiry
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { sendContactFeedbackEmail } from '../_lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.DATABASE_URL;
  if (!url) return res.status(503).json({ error: 'DATABASE_URL is not set' });

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as {
      name?: string;
      phone?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    const { name, phone, email, subject, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
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

    return res.status(201).json({ success: true, id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save feedback';
    return res.status(500).json({ error: errorMsg });
  }
}
