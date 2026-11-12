// api/admin/change-password.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = (req.headers.authorization || '') as string;
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing admin token' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { currentPassword, newPassword, newUsername } = body as {
      currentPassword?: string;
      newPassword?: string;
      newUsername?: string;
    };

    if (!newPassword && !newUsername) {
      return res.status(400).json({ error: 'Either new username or new password must be provided' });
    }

    if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    let validPass = process.env.ADMIN_PASSWORD || 'admin@hariharan1981';
    let validUser = process.env.ADMIN_ID || 'admin';

    const sql = getDb();

    try {
      const rows = await sql`
        SELECT key, value FROM admin_settings WHERE key IN ('admin_password', 'admin_username')
      `;
      for (const row of rows as any[]) {
        if (row.key === 'admin_password' && row.value) validPass = row.value;
        if (row.key === 'admin_username' && row.value) validUser = row.value;
      }
    } catch {
      // Table might not exist yet
    }

    if (currentPassword !== validPass) {
      return res.status(403).json({ error: 'Current password is incorrect' });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        key text primary key,
        value text not null,
        updated_at timestamptz not null default now()
      )
    `;

    if (newPassword) {
      await sql`
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES ('admin_password', ${newPassword}, now())
        ON CONFLICT (key) DO UPDATE
        SET value = ${newPassword}, updated_at = now()
      `;
    }

    if (newUsername && newUsername.trim()) {
      const trimmedUser = newUsername.trim();
      await sql`
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES ('admin_username', ${trimmedUser}, now())
        ON CONFLICT (key) DO UPDATE
        SET value = ${trimmedUser}, updated_at = now()
      `;
      validUser = trimmedUser;
    }

    const updatedPass = newPassword || validPass;
    const newToken = btoa(`${validUser}:${Date.now()}:${updatedPass.slice(0, 4)}`);

    return res.status(200).json({
      success: true,
      message: 'Credentials updated successfully in Supabase',
      token: newToken,
      user: { username: validUser, role: 'administrator' },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update credentials';
    return res.status(500).json({ error: errorMsg });
  }
}
