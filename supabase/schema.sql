-- AGROBIOSTORE - MODUL 4
-- Jalankan seluruh script ini di Supabase Dashboard > SQL Editor > New query.
-- RLS wajib aktif: setiap akun hanya dapat membaca/mengubah baris miliknya sendiri.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  buyer_name text not null,
  delivery_address text not null,
  payment_method text not null check (payment_method in ('Transfer bank', 'COD (simulasi)')),
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  status text not null default 'Menunggu'
    check (status in ('Menunggu', 'Diproses', 'Dibatalkan', 'Selesai')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_created_at_idx
  on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
  on public.orders for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own orders" on public.orders;
create policy "Users can update own orders"
  on public.orders for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own orders" on public.orders;
create policy "Users can delete own orders"
  on public.orders for delete to authenticated
  using (auth.uid() = user_id);

-- Codelab 5 Modul 4: tabel missions untuk demonstrasi CRUD dan RLS.
-- Dalam konteks AgrobioStore, misi merepresentasikan agenda/kegiatan perawatan pertanian.
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  reward_points integer not null default 100 check (reward_points >= 0),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists missions_user_created_at_idx
  on public.missions (user_id, created_at desc);

alter table public.missions enable row level security;

drop policy if exists "Users can read own missions" on public.missions;
create policy "Users can read own missions"
  on public.missions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own missions" on public.missions;
create policy "Users can create own missions"
  on public.missions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own missions" on public.missions;
create policy "Users can update own missions"
  on public.missions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own missions" on public.missions;
create policy "Users can delete own missions"
  on public.missions for delete to authenticated
  using (auth.uid() = user_id);

-- Hak akses Data API; RLS tetap membatasi baris per pengguna.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.missions to authenticated;
