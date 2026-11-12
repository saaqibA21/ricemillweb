import handler from './api/admin/products';

process.env.DATABASE_URL = 'postgresql://postgres.auviqeajkgtvnlsuofta:FAAZ_201912334@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

async function test() {
  const req = new Request('http://localhost:3000/api/admin/products', {
    method: 'GET',
    headers: { Authorization: 'Bearer test' },
  });
  const res = await handler(req);
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Is array:', Array.isArray(data));
  console.log('Products returned:', data.length);
  console.log('First product:', data[0]?.name);
}

test().catch(console.error);
