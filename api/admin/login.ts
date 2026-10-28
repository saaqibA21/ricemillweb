// api/admin/login.ts
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

  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };

    const validUser = process.env.ADMIN_ID || 'admin';
    let validPass = process.env.ADMIN_PASSWORD || 'admin@hariharan1981';

    // Check if custom password is set in the database
    const url = process.env.DATABASE_URL;
    if (url) {
      try {
        const sql = neon(url);
        const rows = await sql`SELECT value FROM admin_settings WHERE key = 'admin_password' LIMIT 1`;
        if (rows && rows.length > 0 && rows[0].value) {
          validPass = rows[0].value;
        }
      } catch (dbErr) {
        console.warn('Could not read admin_settings, falling back to env/default password:', dbErr);
      }
    }

    const normalizedUser = (username || '').trim().toLowerCase();
    const isUserMatch =
      normalizedUser === validUser.toLowerCase() ||
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
