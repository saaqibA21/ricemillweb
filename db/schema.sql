-- db/schema.sql
-- Run once via `npm run db:migrate` after DATABASE_URL is set.

create table if not exists products (
  id text primary key,
  name text not null,
  slug text unique not null,
  variety text not null,
  description text not null,
  long_description text not null,
  image text not null,
  images jsonb not null default '[]',
  grain_length text not null,
  aroma text not null,
  moisture text not null,
  cooking_time text not null,
  best_for jsonb not null default '[]',
  badges jsonb not null default '[]',
  prices jsonb not null default '[]',
  stock integer not null default 0,
  rating numeric not null default 0,
  reviews integer not null default 0,
  is_wholesale_available boolean not null default false,
  min_wholesale_qty integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_variety on products(variety);

create table if not exists orders (
  id text primary key,
  items jsonb not null,
  total numeric not null,
  status text not null default 'pending',
  payment_method text not null,
  payment_status text not null default 'pending',
  address jsonb not null,
  created_at timestamptz not null default now(),
  estimated_delivery timestamptz
);
