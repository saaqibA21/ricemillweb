// api/admin/products.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { defaultProducts } from '../_lib/catalog.js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = (req.headers.authorization || '') as string;
  if (!authHeader.startsWith('Bearer ') && req.method !== 'GET') {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const sql = getDb();

  try {
    // 1. GET: Fetch all products
    if (req.method === 'GET') {
      try {
        const rows = await sql`select * from products order by created_at desc`;
        if (rows && rows.length > 0) {
          return res.status(200).json(rows.map(mapRow));
        }
      } catch (err: unknown) {
        console.warn('DB query error in admin products, falling back to static:', err);
      }
      return res.status(200).json(defaultProducts);
    }

    // 2. POST: Add new product
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const id = body.id || `rm-${Date.now()}`;
      const name = (body.name || '').trim();
      if (!name) return res.status(400).json({ error: 'Product name is required' });

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

      return res.status(201).json({ success: true, message: 'Product created successfully', id, slug });
    }

    // 3. PUT: Update existing product
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const id = body.id;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });

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

      return res.status(200).json({ success: true, message: 'Product updated successfully', id });
    }

    // 4. DELETE: Remove product
    if (req.method === 'DELETE') {
      const id = req.query.id as string | undefined;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });

      await sql`delete from products where id = ${id}`;
      return res.status(200).json({ success: true, message: 'Product deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    console.error('Admin products API error:', err);
    const message = err instanceof Error ? err.message : 'Database error';
    return res.status(500).json({ error: message });
  }
}
