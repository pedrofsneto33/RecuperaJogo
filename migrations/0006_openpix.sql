alter table site_settings add column if not exists openpix_app_id text not null default '';
alter table site_settings add column if not exists webhook_secret text not null default '';

alter table pix_orders add column if not exists paid_at timestamptz;
alter table pix_orders add column if not exists provider text not null default 'static';
