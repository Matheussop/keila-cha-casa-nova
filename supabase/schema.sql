create extension if not exists "pgcrypto";

create table if not exists public.gift_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  note text,
  status text not null default 'available' check (status in ('available', 'reserved')),
  reserved_by_name text,
  reserved_by_whatsapp text,
  reserved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id integer primary key,
  display_name text not null,
  hero_message text not null,
  closing_message text not null,
  pix_key text not null default '',
  pix_holder_name text not null default '',
  pix_message text not null,
  whatsapp_link text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists gift_items_set_updated_at on public.gift_items;
create trigger gift_items_set_updated_at
before update on public.gift_items
for each row
execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

insert into public.site_settings (
  id,
  display_name,
  hero_message,
  closing_message,
  pix_key,
  pix_holder_name,
  pix_message,
  whatsapp_link
)
values (
  1,
  'Keila',
  'Que alegria ter voce por aqui. Montei esta lista com algumas sugestoes para o meu cha de casa nova. Se escolher um item, ele fica reservado para evitar repeticao e deixar tudo organizado para todos.',
  'Sua presenca, carinho e lembranca ja significam muito para mim. Obrigada por fazer parte deste momento tao especial.',
  '',
  'Keila',
  'Se for mais pratico, voce tambem pode contribuir por Pix. Assim eu consigo complementar itens da casa conforme as necessidades do dia a dia.',
  ''
)
on conflict (id) do update set
  display_name = excluded.display_name,
  hero_message = excluded.hero_message,
  closing_message = excluded.closing_message,
  pix_message = excluded.pix_message;

insert into public.gift_items (name, category, note, status)
select seed.name, seed.category, seed.note, seed.status
from (
  values
    ('Jogo de pratos rasos', 'Cozinha', 'Conjunto com 6 pecas', 'available'),
    ('Jogo de copos', 'Cozinha', '6 copos de vidro', 'available'),
    ('Faqueiro', 'Cozinha', '24 pecas', 'available'),
    ('Panela media antiaderente', 'Cozinha', 'Pode ser com tampa', 'available'),
    ('Jogo de potes', 'Cozinha', 'Preferencia por potes com tampa', 'available'),
    ('Toalhas de banho', 'Banheiro', 'Jogo com 2 unidades', 'available'),
    ('Tapete para banheiro', 'Banheiro', 'Tom neutro', 'available'),
    ('Jogo de cama casal', 'Quarto', 'Lencol e fronhas', 'available'),
    ('Travesseiros', 'Quarto', 'Par de travesseiros', 'available'),
    ('Manta para sofa', 'Sala', 'Tecido leve', 'available'),
    ('Almofadas decorativas', 'Sala', 'Duas unidades', 'available'),
    ('Cesto organizador', 'Organizacao', 'Pode ser em fibra ou tecido', 'available')
) as seed(name, category, note, status)
where not exists (
  select 1 from public.gift_items
);
