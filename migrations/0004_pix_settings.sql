create table if not exists site_settings (
  id             int primary key default 1,
  pix_chave      text not null default '',
  pix_titular    text not null default '',
  pix_cidade     text not null default '',
  owner_user_id  text,
  updated_at     timestamptz not null default now(),
  constraint site_settings_one_row check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;
