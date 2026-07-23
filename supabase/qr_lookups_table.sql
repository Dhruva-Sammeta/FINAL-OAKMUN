create table if not exists qr_lookups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  found boolean not null,
  delegate_id uuid references delegates(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists qr_lookups_email_idx on qr_lookups (email);
create index if not exists qr_lookups_created_at_idx on qr_lookups (created_at desc);
