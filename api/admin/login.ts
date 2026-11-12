// api/admin/login.ts
import { getDb } from '../_lib/db';

// runtime: nodejs

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };

    let validUser = process.env.ADMIN_ID || 'admin';
    let validPass = process.env.ADMIN_PASSWORD || 'admin@hariharan1981';

    // Check if custom username or password is set in the database
    const url = process.env.DATABASE_URL;
    if (url) {
      try {
        const sql = getDb();
        const rows = await sql`
          SELECT key, value FROM admin_settings WHERE key IN ('admin_password', 'admin_username')
        `;
        for (const row of rows) {
          if (row.key === 'admin_password' && row.value) validPass = row.value;
          if (row.key === 'admin_username' && row.value) validUser = row.value;
        }
      } catch (dbErr) {
        console.warn('Could not read admin_settings, falling back to env/default password:', dbErr);
      }
    }

    const normalizedUser = (username || '').trim().toLowerCase();
    const isUserMatch =
      normalizedUser === validUser.toLowerCase() ||
      normalizedUser === 'admin' ||
      normalizedUser === 'admin@hariharantraders.com' ||
      normalizedUser === 'hariharantradersorders@gmail.com';

    if (isUserMatch && password === validPass) {
      // Create a deterministic session token
      const token = btoa(`${validUser}:${Date.now()}:${validPass.slice(0, 4)}`);
      return json({
        success: true,
        token,
        user: { username: validUser, role: 'administrator' },
      });
    }

    return json({ error: 'Invalid admin username or password' }, 401);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed';
    return json({ error: errorMsg }, 500);
  }
}
