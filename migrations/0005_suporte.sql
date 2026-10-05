create table if not exists support_tickets (
  id         serial primary key,
  user_id    text,
  email      text not null,
  tipo       text not null default 'suporte',
  mensagem   text not null,
  status     text not null default 'aberto',
  created_at timestamptz not null default now()
);
create index if not exists support_tickets_status_idx on support_tickets (status);
