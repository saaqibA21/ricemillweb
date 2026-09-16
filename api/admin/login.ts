// api/admin/login.ts
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
    const validPass = process.env.ADMIN_PASSWORD || 'admin@hariharan1981';

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
