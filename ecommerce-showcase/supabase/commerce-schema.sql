-- Run this in the Supabase SQL editor. Passwords are handled by Supabase Auth,
-- not stored in a public table. The profiles table is the secure equivalent of Users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null, category text not null check (category in ('Jackets', 'Shoes')),
  price numeric(10,2) not null check (price >= 0), description text, image text,
  stock integer not null default 0 check (stock >= 0), created_at timestamptz not null default now()
);
create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id), quantity integer not null check (quantity > 0), size text, color text,
  unique (user_id, product_id, size, color)
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
  total_price numeric(10,2) not null check (total_price >= 0), status text not null default 'pending', created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id), quantity integer not null check (quantity > 0), size text, color text,
  price numeric(10,2) not null check (price >= 0)
);

alter table public.profiles enable row level security;
alter table public.cart enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "cart own rows" on public.cart for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders own rows" on public.orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "order items own orders" on public.order_items for all using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())) with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
