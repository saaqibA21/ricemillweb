// api/admin/change-password.ts
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

  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized: missing token' }, 401);
  }

  const url = process.env.DATABASE_URL;
  if (!url) return json({ error: 'DATABASE_URL not configured' }, 503);

  try {
    const { currentPassword, newPassword } = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return json({ error: 'Current password and new password are required' }, 400);
    }

    if (newPassword.length < 6) {
      return json({ error: 'New password must be at least 6 characters long' }, 400);
    }

    const sql = neon(url);

    // Ensure settings table exists
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        key text PRIMARY KEY,
        value text NOT NULL,
        updated_at timestamptz DEFAULT now()
      )
    `;

    // Fetch existing password
    let validPass = process.env.ADMIN_PASSWORD || 'admin@hariharan1981';
    const rows = await sql`SELECT value FROM admin_settings WHERE key = 'admin_password' LIMIT 1`;
    if (rows && rows.length > 0 && rows[0].value) {
      validPass = rows[0].value;
    }

    // Verify current password
    if (currentPassword !== validPass) {
      return json({ error: 'Current password does not match' }, 400);
    }

    // Update password
    await sql`
      INSERT INTO admin_settings (key, value, updated_at)
      VALUES ('admin_password', ${newPassword}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;

    return json({
      success: true,
      message: 'Password updated successfully! Please remember your new password.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update password';
    return json({ error: msg }, 500);
  }
}
