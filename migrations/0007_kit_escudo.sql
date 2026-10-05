alter table subscriptions add column if not exists kit_rh boolean not null default false;

alter table pix_orders add column if not exists produto text not null default 'pacote';

alter table petitions add column if not exists hash text;
alter table petitions add column if not exists doc_tipo text not null default 'peticao';

create table if not exists escudo_feed (
  id         serial primary key,
  dominio    text not null unique,
  grupo      text not null default 'offshore',
  nota       text,
  created_at timestamptz not null default now()
);

create table if not exists escudo_meta (
  id             int primary key default 1,
  atualizado_em  timestamptz not null default now()
);

insert into escudo_meta (id, atualizado_em) values (1, now())
  on conflict (id) do nothing;

insert into escudo_feed (dominio, grupo, nota) values
  ('tigrinho.io', 'offshore', 'espelho de caça-níquel — conferir se ainda resolve'),
  ('jogos-fortune.online', 'offshore', 'domínio curto de cassino'),
  ('aposta-pix.vip', 'offshore', 'oferta irregular sem .bet.br')
on conflict (dominio) do nothing;
