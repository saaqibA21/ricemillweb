// api/_lib/products.ts
// Shared helpers for the products API routes. Files under an `_`-prefixed
// folder are not treated as routes by Vercel.
import { neon } from '@neondatabase/serverless';

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export function mapProductRow(r: Record<string, unknown>) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    variety: r.variety,
    description: r.description,
    longDescription: r.long_description,
    image: r.image,
    images: r.images,
    grainLength: r.grain_length,
    aroma: r.aroma,
    moisture: r.moisture,
    cookingTime: r.cooking_time,
    bestFor: r.best_for,
    badges: r.badges,
    prices: r.prices,
    stock: r.stock,
    rating: Number(r.rating),
    reviews: r.reviews,
    isWholesaleAvailable: r.is_wholesale_available,
    minWholesaleQty: r.min_wholesale_qty,
  };
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
