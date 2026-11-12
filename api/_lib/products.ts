// api/_lib/products.ts
// Shared helpers for the products API routes. Files under an `_`-prefixed
// folder are not treated as routes by Vercel.
import { getDb } from './db.js';

export function db() {
  return getDb();
}

export function parseJsonArray<T = unknown>(val: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as T[];
      if (typeof parsed === 'string') {
        const doubleParsed = JSON.parse(parsed);
        if (Array.isArray(doubleParsed)) return doubleParsed as T[];
      }
    } catch {
      if (val.includes(',')) {
        return val.split(',').map((s) => s.trim()).filter(Boolean) as unknown as T[];
      }
      if (val.trim()) {
        return [val.trim()] as unknown as T[];
      }
    }
  }
  return fallback;
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
    images: parseJsonArray<string>(r.images, [(r.image as string) || '/assets/rice-bowl.jpg']),
    grainLength: r.grain_length || '8.0mm',
    aroma: r.aroma || 'Medium',
    moisture: r.moisture || '≤13%',
    cookingTime: r.cooking_time || '15-20 min',
    bestFor: parseJsonArray<string>(r.best_for, ['Daily Cooking']),
    badges: parseJsonArray<string>(r.badges, ['Premium Quality']),
    prices: parseJsonArray(r.prices, [{ weight: '26 kg', weightKg: 26, price: 1100, originalPrice: 1250 }]),
    stock: Number(r.stock) || 100,
    rating: Number(r.rating) || 5.0,
    reviews: Number(r.reviews) || 10,
    isWholesaleAvailable: r.is_wholesale_available !== false,
    minWholesaleQty: Number(r.min_wholesale_qty) || 1,
  };
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
