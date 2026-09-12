// api/export/index.ts
// POST /api/export -> save wholesale and export inquiry
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
      companyName?: string;
      contactName?: string;
      phone?: string;
      email?: string;
      country?: string;
      products?: string;
      quantity?: string;
      message?: string;
    };
    const { companyName, contactName, phone, email, country, products, quantity, message } = body;

    if (!contactName || !phone || !email) {
      return json({ error: 'Contact name, phone, and email are required' }, 400);
    }

    const sql = neon(url);
    const id = `EXP${Date.now()}`;

    await sql`
      insert into export_requests (id, company_name, contact_name, phone, email, country, products, quantity, message)
      values (
        ${id},
        ${companyName || null},
        ${contactName},
        ${phone},
        ${email},
        ${country || 'India'},
        ${products || null},
        ${quantity || null},
        ${message || null}
      )
    `;

    return json({ success: true, id }, 201);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save export inquiry';
    return json({ error: errorMsg }, 500);
  }
}
