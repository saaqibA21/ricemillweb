// api/export/index.ts
// POST /api/export -> save wholesale and export inquiry
import { neon } from '@neondatabase/serverless';
import { sendWholesaleInquiryEmail } from '../_lib/email';

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
      return sendResponse(res, { error: 'Contact name, phone, and email are required' }, 400);
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
    sendWholesaleInquiryEmail({
      companyName,
      contactName,
      phone,
      email,
      country,
      products: products ? [products] : [],
      quantityMT: quantity ? parseFloat(quantity) || 0 : 0,
      message,
    }).catch((err) => console.warn('Wholesale inquiry email warning:', err));

    return sendResponse(res, { success: true, id }, 201);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save export inquiry';
    return sendResponse(res, { error: errorMsg }, 500);
  }
}
