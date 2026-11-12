// api/contact/index.ts
// POST /api/contact -> save customer feedback / inquiry
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { sendContactFeedbackEmail } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  

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

    const sql = getDb();
    const id = `FB${Date.now()}`;

    await sql`
      insert into feedbacks (id, name, phone, email, subject, message)
      values (${id}, ${name}, ${phone || null}, ${email}, ${subject || null}, ${message})
    `;

    // Trigger automated notification email
    await sendContactFeedbackEmail({
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
