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
    const { currentPassword, newUsername, newPassword } = (await req.json()) as {
      currentPassword?: string;
      newUsername?: string;
      newPassword?: string;
    };

    if (!currentPassword) {
      return json({ error: 'Current password is required to make changes' }, 400);
    }

    const hasNewUsername = typeof newUsername === 'string' && newUsername.trim().length > 0;
    const hasNewPassword = typeof newPassword === 'string' && newPassword.length > 0;

    if (!hasNewUsername && !hasNewPassword) {
      return json({ error: 'Please enter a new username or new password to update' }, 400);
    }

    if (hasNewUsername && newUsername.trim().length < 3) {
      return json({ error: 'New username must be at least 3 characters long' }, 400);
    }

    if (hasNewPassword && newPassword.length < 6) {
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

    // Fetch existing credentials
    let validPass = process.env.ADMIN_PASSWORD || 'admin@hariharan1981';
    let validUser = process.env.ADMIN_ID || 'admin';

    const rows = await sql`
      SELECT key, value FROM admin_settings WHERE key IN ('admin_password', 'admin_username')
    `;
    for (const row of rows) {
      if (row.key === 'admin_password' && row.value) validPass = row.value;
      if (row.key === 'admin_username' && row.value) validUser = row.value;
    }

    // Verify current password
    if (currentPassword !== validPass) {
      return json({ error: 'Current password does not match' }, 400);
    }

    const updates: string[] = [];

    // Update username if requested and different
    if (hasNewUsername && newUsername.trim() !== validUser) {
      const trimmedUser = newUsername.trim();
      await sql`
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES ('admin_username', ${trimmedUser}, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;
      validUser = trimmedUser;
      updates.push('username');
    }

    // Update password if requested
    if (hasNewPassword) {
      await sql`
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES ('admin_password', ${newPassword}, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;
      validPass = newPassword;
      updates.push('password');
    }

    if (updates.length === 0) {
      return json({ error: 'New username matches the current username. No changes to save.' }, 400);
    }

    const newToken = btoa(`${validUser}:${Date.now()}:${validPass.slice(0, 4)}`);

    const message = updates.length === 2
      ? 'Admin username and password updated successfully!'
      : updates[0] === 'username'
      ? `Admin username updated to "${validUser}" successfully!`
      : 'Admin password updated successfully!';

    return json({
      success: true,
      message,
      username: validUser,
      token: newToken,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update credentials';
    return json({ error: msg }, 500);
  }
}
