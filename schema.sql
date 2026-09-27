-- Run this whole file once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- It creates two tables and locks them down so every signed-up user can only
-- ever read or write their own rows, no matter how many people use the app.

create table if not exists public.business_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null default '',
  currency text not null default '₹',
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  city text default '',
  products text default '',
  total numeric not null default 0,
  delivery numeric not null default 0,
  material numeric not null default 0,
  packaging numeric not null default 0,
  shipping numeric not null default 0,
  other numeric not null default 0,
  profit numeric not null default 0,
  order_date date,
  payment text not null default 'unpaid',      -- 'unpaid' | 'partial' | 'paid'
  paid_amount numeric not null default 0,
  status text not null default 'pending',       -- 'pending' | 'completed'
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_user_date_idx on public.orders(user_id, order_date);

alter table public.business_settings enable row level security;
alter table public.orders enable row level security;

-- Each user may only see and change their OWN settings row.
create policy "own settings - select" on public.business_settings
  for select using (auth.uid() = user_id);
create policy "own settings - insert" on public.business_settings
  for insert with check (auth.uid() = user_id);
create policy "own settings - update" on public.business_settings
  for update using (auth.uid() = user_id);

-- Each user may only see and change their OWN orders.
create policy "own orders - select" on public.orders
  for select using (auth.uid() = user_id);
create policy "own orders - insert" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "own orders - update" on public.orders
  for update using (auth.uid() = user_id);
create policy "own orders - delete" on public.orders
  for delete using (auth.uid() = user_id);
