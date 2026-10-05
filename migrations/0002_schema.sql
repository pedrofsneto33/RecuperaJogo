-- RecuperaJogo app tables (user_id is TEXT — Better Auth ids / preview 'dev-user')

create table if not exists subscriptions (
  id              serial primary key,
  user_id         text not null unique,
  status          text not null default 'pending',
  peticoes_usadas int not null default 0,
  activated_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on subscriptions (user_id);

create table if not exists leads (
  id         serial primary key,
  email      text not null,
  nome       text,
  origem     text not null default 'guia',
  created_at timestamptz not null default now()
);

create table if not exists petitions (
  id         serial primary key,
  user_id    text not null,
  perfil     text not null,
  created_at timestamptz not null default now()
);
create index if not exists petitions_user_id_idx on petitions (user_id);
