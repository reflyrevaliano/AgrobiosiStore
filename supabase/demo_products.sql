-- AgrobiosiStore: 100,000 synthetic products, isolated from the existing catalogue.
-- Run in the AgrobiosiStore project SQL Editor as database administrator.
begin;
create table if not exists public.demo_products (
  id integer primary key check (id between 1 and 100000),
  name text not null,
  category text not null,
  price integer not null check (price >= 0),
  stock integer not null check (stock >= 0),
  is_dummy boolean not null default true check (is_dummy)
);
alter table public.demo_products enable row level security;
revoke all on public.demo_products from public, anon, authenticated;
grant select on public.demo_products to authenticated;
drop policy if exists demo_products_read on public.demo_products;
create policy demo_products_read on public.demo_products for select to authenticated using (true);
create index if not exists demo_products_category_id_idx on public.demo_products(category, id);
-- Deterministic data: repeatable and exactly 100,000 distinct IDs.
with generated as (
  select i, case when i <= 25000 then 'Pupuk'
                 when i <= 50000 then 'Bibit Tanaman'
                 when i <= 70000 then 'Benih Tanaman'
                 when i <= 85000 then 'Pestisida'
                 else 'Peralatan Pertanian' end as category
  from generate_series(1,100000) as g(i)
)
insert into public.demo_products (id, name, category, price, stock, is_dummy)
select i,
  (case category
    when 'Pupuk' then (array['Pupuk Organik','Pupuk NPK','Kompos','Pupuk Cair'])[(i % 4)+1]
    when 'Bibit Tanaman' then (array['Bibit Cabai','Bibit Tomat','Bibit Terong','Bibit Melon'])[(i % 4)+1]
    when 'Benih Tanaman' then (array['Benih Jagung','Benih Padi','Benih Bayam','Benih Kangkung'])[(i % 4)+1]
    when 'Pestisida' then (array['Pestisida Nabati','Fungisida','Insektisida','Herbisida'])[(i % 4)+1]
    else (array['Cangkul','Gembor','Sekop','Sprayer'])[(i % 4)+1]
  end) || ' - ' || lpad(i::text, 6, '0'),
  category, 5000 + (i * 137 % 195000), i * 17 % 301, true
from generated
on conflict (id) do update set name=excluded.name, category=excluded.category,
  price=excluded.price, stock=excluded.stock, is_dummy=excluded.is_dummy;
commit;
-- Proof: expect 100000. No customer data is used.
select count(*) as total_data from public.demo_products;
select category, count(*) as jumlah from public.demo_products group by category order by category;
