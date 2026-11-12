// api/admin/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    let validUser = process.env.ADMIN_ID || 'admin';
    let validPass = process.env.ADMIN_PASSWORD || 'admin@hariharan1981';

    try {
      const sql = getDb();
      const rows = await sql`
        SELECT key, value FROM admin_settings WHERE key IN ('admin_password', 'admin_username')
      `;
      for (const row of rows as any[]) {
        if (row.key === 'admin_password' && row.value) validPass = row.value;
        if (row.key === 'admin_username' && row.value) validUser = row.value;
      }
    } catch (dbErr) {
      console.warn('Could not read admin_settings, falling back to default password:', dbErr);
    }

    const normalizedUser = (username || '').trim().toLowerCase();
    const isUserMatch =
      normalizedUser === validUser.toLowerCase() ||
      normalizedUser === 'admin' ||
      normalizedUser === 'admin@hariharantraders.com' ||
      normalizedUser === 'hariharantradersorders@gmail.com';

    if (isUserMatch && password === validPass) {
      const token = btoa(`${validUser}:${Date.now()}:${validPass.slice(0, 4)}`);
      return res.status(200).json({
        success: true,
        token,
        user: { username: validUser, role: 'administrator' },
      });
    }

    return res.status(401).json({ error: 'Invalid admin username or password' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed';
    return res.status(500).json({ error: errorMsg });
  }
}
