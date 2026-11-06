-- =====================================================================
-- LisansQuiz — Supabase veritabanı şeması
-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını yapıştır → Run
-- Tekrar çalıştırmak güvenlidir (var olanı bozmaz).
-- =====================================================================

-- Dersler
create table if not exists public.lessons (
  id          text primary key,
  code        text not null default '',
  title       text not null,
  emoji       text not null default '📘',
  color       text not null default 'primary',   -- primary | lilac | sky | pink | known | review
  coming_soon boolean not null default false,
  sort        int  not null default 0,
  updated_at  timestamptz not null default now()
);

-- Bölümler
create table if not exists public.sections (
  id         text primary key,
  lesson_id  text not null references public.lessons(id) on delete cascade,
  title      text not null,
  emoji      text not null default '📄',
  sort       int  not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists sections_lesson_idx on public.sections(lesson_id, sort);

-- Kartlar (metinde **kalın** = boşluk doldurmada gizlenen anahtar bilgi)
create table if not exists public.cards (
  id         text primary key,
  section_id text not null references public.sections(id) on delete cascade,
  number     int  not null,
  text       text not null,
  sort       int  not null default 0,
  active     boolean not null default true,
  updated_at timestamptz not null default now()
);
create index if not exists cards_section_idx on public.cards(section_id, sort);

-- Admin olarak yetkili e-postalar (yalnızca SQL Editor'dan eklenir)
create table if not exists public.admins (
  email text primary key
);

-- updated_at otomatik güncellensin
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists lessons_touch on public.lessons;
create trigger lessons_touch before update on public.lessons for each row execute function public.touch_updated_at();
drop trigger if exists sections_touch on public.sections;
create trigger sections_touch before update on public.sections for each row execute function public.touch_updated_at();
drop trigger if exists cards_touch on public.cards;
create trigger cards_touch before update on public.cards for each row execute function public.touch_updated_at();

-- Giriş yapan kullanıcı admin mi?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Güvenlik: herkes okuyabilir, yalnızca admin yazabilir
alter table public.lessons  enable row level security;
alter table public.sections enable row level security;
alter table public.cards    enable row level security;
alter table public.admins   enable row level security;  -- politika yok = dışarıdan erişilemez

drop policy if exists "herkes okur" on public.lessons;
create policy "herkes okur" on public.lessons for select using (true);
drop policy if exists "admin yazar" on public.lessons;
create policy "admin yazar" on public.lessons for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "herkes okur" on public.sections;
create policy "herkes okur" on public.sections for select using (true);
drop policy if exists "admin yazar" on public.sections;
create policy "admin yazar" on public.sections for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "herkes okur" on public.cards;
create policy "herkes okur" on public.cards for select using (true);
drop policy if exists "admin yazar" on public.cards;
create policy "admin yazar" on public.cards for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Erişim izinleri (projede "Automatically expose new tables" kapalı olsa da çalışsın diye açıkça veriliyor).
-- Satır düzeyinde kim neyi yapabilir, yukarıdaki RLS kuralları belirler.
grant usage on schema public to anon, authenticated;
grant select on public.lessons, public.sections, public.cards to anon, authenticated;
grant insert, update, delete on public.lessons, public.sections, public.cards to authenticated;
revoke all on public.admins from anon, authenticated;

-- Admin panelinin "ben admin miyim?" kontrolü için
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- SON ADIM: kendi e-postanı admin olarak ekle (aşağıdaki adresi değiştir)
-- insert into public.admins (email) values ('ornek@eposta.com') on conflict do nothing;
-- ---------------------------------------------------------------------
