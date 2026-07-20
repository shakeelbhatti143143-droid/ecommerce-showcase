-- ===============================
-- E-COMMERCE COMPLETE SCHEMA
-- Run this in Supabase SQL Editor
-- ===============================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  phone text,
  avatar_url text,
  avatar_file_path text,
  is_admin boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image text,
  created_at timestamptz not null default now()
);

-- 3. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2) check (compare_price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  category text not null,
  image text,
  images text[] default '{}',
  stock integer not null default 0 check (stock >= 0),
  rating numeric(2,1) default 0,
  badge text,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. CART
create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, size, color)
);

-- 5. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_cost numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  coupon_code text,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text not null default 'cod' check (payment_method in ('cod','stripe','paypal')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  product_image text,
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  price numeric(10,2) not null check (price >= 0),
  total numeric(10,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

-- 7. ADDRESSES
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  country text not null,
  city text not null,
  address text not null,
  postal_code text,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

-- 8. PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'USD',
  method text not null default 'cod' check (method in ('cod','stripe','paypal')),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  transaction_id text,
  gateway_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. COUPONS
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage','fixed')),
  value numeric(10,2) not null check (value > 0),
  min_purchase numeric(10,2) default 0,
  max_uses integer default 0,
  used_count integer not null default 0,
  expires_at timestamptz,
  active boolean default true,
  created_at timestamptz not null default now()
);

-- 9. INVENTORY LOG
create table if not exists public.inventory_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_change integer not null,
  reason text not null,
  reference_type text,
  reference_id text,
  created_at timestamptz not null default now()
);

-- 10. PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  method text not null check (method in ('cod','stripe','paypal')),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  transaction_id text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===============================
-- INDEXES
-- ===============================
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_cart_user on public.cart(user_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_number on public.orders(order_number);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_addresses_user on public.addresses(user_id);
create index if not exists idx_inventory_product on public.inventory_log(product_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);

-- ===============================
-- ROW LEVEL SECURITY
-- ===============================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;
alter table public.inventory_log enable row level security;
alter table public.payments enable row level security;
alter table public.payments enable row level security;

-- Profiles: users can read/update their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all using (is_admin(auth.uid()));

-- Categories: public read, admin write
create policy "categories_read_all" on public.categories for select using (true);
create policy "categories_admin_all" on public.categories for all using (is_admin(auth.uid()));

-- Products: public read, admin write
create policy "products_read_active" on public.products for select using (active = true OR is_admin(auth.uid()));
create policy "products_admin_all" on public.products for all using (is_admin(auth.uid()));

-- Cart: users own their cart
create policy "cart_own_rows" on public.cart for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders: users see own, admin see all
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id OR is_admin(auth.uid()));
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_update_admin" on public.orders for update using (is_admin(auth.uid()));

-- Order Items: users see their own, admin see all
create policy "order_items_select" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() OR is_admin(auth.uid())))
);
create policy "order_items_insert" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Addresses: users own their addresses
create policy "addresses_own" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Coupons: public read, admin manage
create policy "coupons_read_active" on public.coupons for select using (active = true);
create policy "coupons_admin_all" on public.coupons for all using (is_admin(auth.uid()));

-- Inventory log: admin only
create policy "inventory_admin_all" on public.inventory_log for all using (is_admin(auth.uid()));

-- Payments: users see own, admin see all
create policy "payments_select" on public.payments for select using (
  auth.uid() = user_id OR is_admin(auth.uid())
);
create policy "payments_insert_own" on public.payments for insert with check (auth.uid() = user_id OR is_admin(auth.uid()));
create policy "payments_update_admin" on public.payments for update using (is_admin(auth.uid()));

-- Payments: users can view own, admin all
create policy "payments_select_own" on public.payments for select using (
  exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid())
  or is_admin(auth.uid())
);
create policy "payments_admin_all" on public.payments for all using (is_admin(auth.uid()));

-- ===============================
-- HELPER FUNCTIONS
-- ===============================
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and is_admin = true
  );
$$;

-- Auto-update updated_at trigger
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

create trigger update_orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

-- Auto-generate order number
create or replace function public.generate_order_number()
returns text
language sql
as $$
  select 'ORD-' || upper(substr(md5(random()::text), 1, 8)) || '-' || to_char(now(), 'YYYYMMDD');
$$;

-- Increment coupon usage counter (used by RPC call from client)
create or replace function public.increment_coupon_usage(coupon_code text)
returns void
language plpgsql
as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where code = upper(coupon_code);
end;
$$;

-- Realtime support for e-commerce tables
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.categories;

-- ===============================
-- SEED DATA - Categories
-- ===============================
insert into public.categories (name, slug, description) values
  ('Jackets', 'jackets', 'Premium outerwear for every season'),
  ('Shoes', 'shoes', 'Iconic footwear for any occasion')
on conflict (slug) do nothing;

-- ===============================
-- STORAGE BUCKET (for product images)
-- ===============================
-- Create the public "product-images" bucket used by the admin product uploader.
-- In the Supabase dashboard: Storage -> New bucket -> name "product-images" -> public = ON.
-- Or run the SQL below (requires the storage schema to exist):
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_auth_upload"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ===============================
-- PAYMENT TRIGGER
-- Keep orders.payment_status in sync with the latest payment row.
-- ===============================
create or replace function public.sync_payment_status()
returns trigger
language plpgsql
as $$
begin
  update public.orders
  set payment_status = new.status,
      updated_at = now()
  where id = new.order_id;
  return new;
end;
$$;

drop trigger if exists trg_sync_payment_status on public.payments;
create trigger trg_sync_payment_status
  after insert or update on public.payments
  for each row execute function public.sync_payment_status();

