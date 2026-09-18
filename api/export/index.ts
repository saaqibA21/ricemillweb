// api/export/index.ts
// POST /api/export -> save wholesale and export inquiry
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { sendWholesaleInquiryEmail } from '../_lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.DATABASE_URL;
  if (!url) return res.status(503).json({ error: 'DATABASE_URL is not set' });

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as {
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
      return res.status(400).json({ error: 'Contact name, phone, and email are required' });
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

    // Trigger automated wholesale email dispatch
    await sendWholesaleInquiryEmail({
      companyName,
      contactName,
      phone,
      email,
      country,
      products: products ? [products] : [],
      quantityMT: quantity ? parseFloat(quantity) || 0 : 0,
      message,
    }).catch((err) => console.warn('Wholesale inquiry email warning:', err));

    return res.status(201).json({ success: true, id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save export inquiry';
    return res.status(500).json({ error: errorMsg });
  }
}
