-- Zugang auf feste Personen beschränken.
-- Einmal im Supabase SQL Editor ausführen. Die Mailadressen unten vorher eintragen
-- (die ausgefüllte Fassung liegt bewusst nicht im öffentlichen Repository).

-- 1) Liste der erlaubten Mailadressen. Über die API nicht lesbar (RLS an, keine Regel).
create table if not exists public.erlaubt (email text primary key);
alter table public.erlaubt enable row level security;
delete from public.erlaubt;
insert into public.erlaubt (email) values
  ('ERSTE@ADRESSE'),
  ('ZWEITE@ADRESSE');

-- 2) Prüft, ob die angemeldete Person auf der Liste steht.
create or replace function public.ist_erlaubt() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.erlaubt where email = lower(coalesce(auth.jwt()->>'email','')));
$$;

-- 3) Daten nur für erlaubte Personen (gilt auch für den Live-Abgleich).
drop policy if exists "angemeldet lesen" on public.docs;
drop policy if exists "angemeldet schreiben" on public.docs;
drop policy if exists "erlaubt lesen" on public.docs;
drop policy if exists "erlaubt schreiben" on public.docs;
create policy "erlaubt lesen" on public.docs for select to authenticated using (public.ist_erlaubt());
create policy "erlaubt schreiben" on public.docs for all to authenticated
  using (public.ist_erlaubt()) with check (public.ist_erlaubt());

-- 4) Niemand sonst kann ein Konto anlegen, auch nicht über den Mail-Link.
create or replace function public.nur_erlaubte_konten() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.erlaubt where email = lower(new.email)) then
    raise exception 'Anmeldung nicht erlaubt';
  end if;
  return new;
end $$;
drop trigger if exists nur_erlaubte_konten on auth.users;
create trigger nur_erlaubte_konten before insert or update of email on auth.users
  for each row execute function public.nur_erlaubte_konten();

-- 5) Zum Prüfen: zeigt alle Konten, die nicht auf der Liste stehen (sollte leer sein).
select id, email, created_at from auth.users
 where lower(email) not in (select email from public.erlaubt);
-- Falls dort jemand auftaucht, kann das Konto so entfernt werden:
-- delete from auth.users where lower(email) not in (select email from public.erlaubt);
