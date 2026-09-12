// scripts/seed.ts
// Usage: npm run db:seed
// Migrates the static catalog in src/data/products.ts into the database.
// Safe to re-run — existing rows are upserted by id.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { neon } from '@neondatabase/serverless';
import { products } from '../src/data/products';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL not set. Run `vercel env pull .env.local` after creating the Postgres database in the Vercel dashboard.'
    );
  }
  const sql = neon(url);

  for (const p of products) {
    await sql`
      insert into products (
        id, name, slug, variety, description, long_description, image, images,
        grain_length, aroma, moisture, cooking_time, best_for, badges, prices,
        stock, rating, reviews, is_wholesale_available, min_wholesale_qty
      ) values (
        ${p.id}, ${p.name}, ${p.slug}, ${p.variety}, ${p.description}, ${p.longDescription},
        ${p.image}, ${JSON.stringify(p.images)}, ${p.grainLength}, ${p.aroma}, ${p.moisture},
        ${p.cookingTime}, ${JSON.stringify(p.bestFor)}, ${JSON.stringify(p.badges)},
        ${JSON.stringify(p.prices)}, ${p.stock}, ${p.rating}, ${p.reviews},
        ${p.isWholesaleAvailable}, ${p.minWholesaleQty}
      )
      on conflict (id) do update set
        name = excluded.name,
        slug = excluded.slug,
        variety = excluded.variety,
        description = excluded.description,
        long_description = excluded.long_description,
        image = excluded.image,
        images = excluded.images,
        grain_length = excluded.grain_length,
        aroma = excluded.aroma,
        moisture = excluded.moisture,
        cooking_time = excluded.cooking_time,
        best_for = excluded.best_for,
        badges = excluded.badges,
        prices = excluded.prices,
        stock = excluded.stock,
        rating = excluded.rating,
        reviews = excluded.reviews,
        is_wholesale_available = excluded.is_wholesale_available,
        min_wholesale_qty = excluded.min_wholesale_qty
    `;
    console.log('Seeded', p.slug);
  }
  console.log(`Done — ${products.length} products seeded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
