-- Einmal im Supabase SQL Editor ausführen (SQL Editor → New query → einfügen → Run).
create table if not exists public.docs (
  coll text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (coll, id)
);
alter table public.docs replica identity full;
alter table public.docs enable row level security;

-- Nur angemeldete Personen dürfen lesen und schreiben.
drop policy if exists "angemeldet lesen" on public.docs;
drop policy if exists "angemeldet schreiben" on public.docs;
create policy "angemeldet lesen" on public.docs for select to authenticated using (true);
create policy "angemeldet schreiben" on public.docs for all to authenticated using (true) with check (true);

-- Live-Abgleich zwischen Handy und Laptop.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;
