create table if not exists audit_logs (
  id         serial primary key,
  actor_id   text not null,
  action     text not null,
  target     text,
  ip         text,
  meta       jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);

alter table site_settings add column if not exists wa_token text not null default '';
alter table site_settings add column if not exists wa_phone_id text not null default '';
alter table site_settings add column if not exists wa_template text not null default '';

alter table subscriptions add column if not exists telefone text;
