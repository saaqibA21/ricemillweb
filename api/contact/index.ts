// api/contact/index.ts
// POST /api/contact -> save customer feedback / inquiry
import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = process.env.DATABASE_URL;
  if (!url) return json({ error: 'DATABASE_URL is not set' }, 503);

  try {
    const body = (await req.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    const { name, phone, email, subject, message } = body;

    if (!name || !email || !message) {
      return json({ error: 'Name, email, and message are required' }, 400);
    }

    const sql = neon(url);
    const id = `FB${Date.now()}`;

    await sql`
      insert into feedbacks (id, name, phone, email, subject, message)
      values (${id}, ${name}, ${phone || null}, ${email}, ${subject || null}, ${message})
    `;

    return json({ success: true, id }, 201);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save feedback';
    return json({ error: errorMsg }, 500);
  }
}
