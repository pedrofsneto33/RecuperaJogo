-- PIX orders + complementary self-exclusion (Escudo)

alter table subscriptions add column if not exists payment_method text;
alter table subscriptions add column if not exists pix_txid text;
alter table subscriptions add column if not exists payment_note text;

create table if not exists pix_orders (
  id           serial primary key,
  user_id      text not null,
  amount_cents int not null,
  txid         text not null unique,
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);
create index if not exists pix_orders_user_id_idx on pix_orders (user_id);

create table if not exists shield_locks (
  user_id      text primary key,
  pin_hash     text not null,
  locked_until timestamptz not null,
  created_at   timestamptz not null default now()
);

create table if not exists urge_logs (
  id         serial primary key,
  user_id    text not null,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists urge_logs_user_id_idx on urge_logs (user_id);
