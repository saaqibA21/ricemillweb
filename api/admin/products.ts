// api/admin/products.ts
// Admin API for Managing Products (CRUD)
import { neon } from '@neondatabase/serverless';
import { products as defaultProducts } from '../../src/data/products';

export const config = { runtime: 'edge' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function mapRow(r: Record<string, unknown>) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    variety: r.variety,
    description: r.description,
    longDescription: r.long_description,
    image: r.image,
    images: typeof r.images === 'string' ? JSON.parse(r.images as string) : r.images || [],
    grainLength: r.grain_length || '8.0mm',
    aroma: r.aroma || 'Medium',
    moisture: r.moisture || '≤13%',
    cookingTime: r.cooking_time || '15-20 min',
    bestFor: typeof r.best_for === 'string' ? JSON.parse(r.best_for as string) : r.best_for || [],
    badges: typeof r.badges === 'string' ? JSON.parse(r.badges as string) : r.badges || [],
    prices: typeof r.prices === 'string' ? JSON.parse(r.prices as string) : r.prices || [],
    stock: Number(r.stock) || 0,
    rating: Number(r.rating) || 5.0,
    reviews: Number(r.reviews) || 0,
    isWholesaleAvailable: Boolean(r.is_wholesale_available),
    minWholesaleQty: Number(r.min_wholesale_qty) || 1,
  };
}

export default async function handler(req: Request) {
  const url = process.env.DATABASE_URL;
  if (!url) return json({ error: 'DATABASE_URL not configured' }, 503);

  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ') && req.method !== 'GET') {
    return json({ error: 'Unauthorized: missing token' }, 401);
  }

  const sql = neon(url);

  try {
    // 1. GET: Fetch all products (with auto-seed fallback)
    if (req.method === 'GET') {
      try {
        const rows = await sql`select * from products order by created_at desc`;
        if (rows && rows.length > 0) {
          return json(rows.map(mapRow));
        }
      } catch (err) {
        // Create table if not exists
        await sql`
          create table if not exists products (
            id text primary key,
            name text not null,
            slug text unique not null,
            variety text not null,
            description text not null,
            long_description text not null,
            image text not null,
            images jsonb not null default '[]',
            grain_length text not null default '8.0mm',
            aroma text not null default 'Medium',
            moisture text not null default '≤13%',
            cooking_time text not null default '18 min',
            best_for jsonb not null default '[]',
            badges jsonb not null default '[]',
            prices jsonb not null default '[]',
            stock integer not null default 100,
            rating numeric not null default 5.0,
            reviews integer not null default 10,
            is_wholesale_available boolean not null default true,
            min_wholesale_qty integer not null default 1,
            created_at timestamptz not null default now()
          )
        `;
      }

      // If empty in DB, seed from default catalog so admin can see and edit them immediately
      for (const p of defaultProducts) {
        await sql`
          insert into products (
            id, name, slug, variety, description, long_description, image, images,
            grain_length, aroma, moisture, cooking_time, best_for, badges, prices,
            stock, rating, reviews, is_wholesale_available, min_wholesale_qty
          ) values (
            ${p.id}, ${p.name}, ${p.slug}, ${p.variety}, ${p.description}, ${p.longDescription},
            ${p.image}, ${JSON.stringify(p.images || [p.image])}, ${p.grainLength}, ${p.aroma}, ${p.moisture},
            ${p.cookingTime}, ${JSON.stringify(p.bestFor || [])}, ${JSON.stringify(p.badges || [])},
            ${JSON.stringify(p.prices)}, ${p.stock || 100}, ${p.rating || 5}, ${p.reviews || 0},
            ${p.isWholesaleAvailable ?? true}, ${p.minWholesaleQty || 1}
          )
          on conflict (id) do nothing
        `;
      }

      const rowsAfterSeed = await sql`select * from products order by created_at desc`;
      return json(rowsAfterSeed.map(mapRow));
    }

    // 2. POST: Add new product
    if (req.method === 'POST') {
      const body = await req.json();
      const id = body.id || `rm-${Date.now()}`;
      const name = (body.name || '').trim();
      if (!name) return json({ error: 'Product name is required' }, 400);

      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = body.slug || `${baseSlug}-${Date.now().toString().slice(-4)}`;
      const variety = body.variety || 'Basmati';
      const description = body.description || name;
      const longDescription = body.longDescription || description;
      const image = body.image || '/assets/rice-bowl.jpg';
      const images = body.images && body.images.length > 0 ? body.images : [image];
      const grainLength = body.grainLength || '8.0mm';
      const aroma = body.aroma || 'Natural';
      const moisture = body.moisture || '≤12.5%';
      const cookingTime = body.cookingTime || '15–20 min';
      const bestFor = body.bestFor || ['Daily cooking'];
      const badges = body.badges || ['Pure Quality'];
      const prices = body.prices && body.prices.length > 0 ? body.prices : [
        { weight: '1 kg', weightKg: 1, price: 90 },
        { weight: '5 kg', weightKg: 5, price: 430 },
        { weight: '25 kg', weightKg: 25, price: 2100 },
      ];
      const stock = Number(body.stock) || 100;
      const rating = Number(body.rating) || 5;
      const reviews = Number(body.reviews) || 1;
      const isWholesaleAvailable = body.isWholesaleAvailable ?? true;
      const minWholesaleQty = Number(body.minWholesaleQty) || 1;

      await sql`
        insert into products (
          id, name, slug, variety, description, long_description, image, images,
          grain_length, aroma, moisture, cooking_time, best_for, badges, prices,
          stock, rating, reviews, is_wholesale_available, min_wholesale_qty
        ) values (
          ${id}, ${name}, ${slug}, ${variety}, ${description}, ${longDescription},
          ${image}, ${JSON.stringify(images)}, ${grainLength}, ${aroma}, ${moisture},
          ${cookingTime}, ${JSON.stringify(bestFor)}, ${JSON.stringify(badges)},
          ${JSON.stringify(prices)}, ${stock}, ${rating}, ${reviews},
          ${isWholesaleAvailable}, ${minWholesaleQty}
        )
      `;

      return json({ success: true, message: 'Product created successfully', id, slug }, 201);
    }

    // 3. PUT: Update existing product
    if (req.method === 'PUT') {
      const body = await req.json();
      const id = body.id;
      if (!id) return json({ error: 'Product ID is required' }, 400);

      const name = (body.name || '').trim();
      const variety = body.variety || 'Basmati';
      const description = body.description || '';
      const longDescription = body.longDescription || description;
      const image = body.image || '/assets/rice-bowl.jpg';
      const images = body.images && body.images.length > 0 ? body.images : [image];
      const grainLength = body.grainLength || '8.0mm';
      const aroma = body.aroma || 'Natural';
      const moisture = body.moisture || '≤12.5%';
      const cookingTime = body.cookingTime || '15–20 min';
      const bestFor = body.bestFor || [];
      const badges = body.badges || [];
      const prices = body.prices || [];
      const stock = Number(body.stock) || 0;
      const isWholesaleAvailable = Boolean(body.isWholesaleAvailable);
      const minWholesaleQty = Number(body.minWholesaleQty) || 1;

      await sql`
        update products set
          name = ${name},
          variety = ${variety},
          description = ${description},
          long_description = ${longDescription},
          image = ${image},
          images = ${JSON.stringify(images)},
          grain_length = ${grainLength},
          aroma = ${aroma},
          moisture = ${moisture},
          cooking_time = ${cookingTime},
          best_for = ${JSON.stringify(bestFor)},
          badges = ${JSON.stringify(badges)},
          prices = ${JSON.stringify(prices)},
          stock = ${stock},
          is_wholesale_available = ${isWholesaleAvailable},
          min_wholesale_qty = ${minWholesaleQty}
        where id = ${id}
      `;

      return json({ success: true, message: 'Product updated successfully', id });
    }

    // 4. DELETE: Remove product
    if (req.method === 'DELETE') {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return json({ error: 'Product ID is required' }, 400);

      await sql`delete from products where id = ${id}`;
      return json({ success: true, message: 'Product deleted successfully', id });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: unknown) {
    console.error('Admin products API error:', err);
    const message = err instanceof Error ? err.message : 'Database error';
    return json({ error: message }, 500);
  }
}
