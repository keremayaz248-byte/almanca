-- ══════════════════════════════════════════════════════════════
-- Almanca Duo — Supabase veritabanı şeması
-- Supabase projesi açıldıktan sonra: Dashboard → SQL Editor → bu dosyanın
-- TAMAMINI yapıştır → Run. Tüm tabloları ve güvenlik kurallarını tek seferde kurar.
-- ══════════════════════════════════════════════════════════════

-- 1) PROFİLLER — her kullanıcının görünen adı ve ortak sınıf bilgisi
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_emoji text default '🧑',
  created_at timestamptz default now()
);

-- 2) ARKADAŞLIK — iki kullanıcıyı aynı "ortak sınıfa" bağlar
create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  status text default 'active' check (status in ('pending','active')),
  created_at timestamptz default now(),
  unique(user_a, user_b)
);

-- 3) KONULAR — PLAN30'daki 30 günün ve PDF'ten çıkarılan 38+28 konunun kaydı
create table if not exists topics (
  id text primary key,              -- örn: 'imperativ', 'perfekt', gün no'su vb.
  title text not null,
  kaynak text,                      -- 't1' | 'kl' | 'a2' | 't2'
  sayfa text,
  plan_gun int                      -- PLAN30'daki gün numarası (varsa)
);

-- 4) KULLANICI × KONU İLERLEMESİ — her kullanıcının her konudaki durumu
create table if not exists user_topic_progress (
  user_id uuid references profiles(id) on delete cascade,
  topic_id text references topics(id) on delete cascade,
  dogru int default 0,
  yanlis int default 0,
  tamamlandi boolean default false,
  son_calisma timestamptz default now(),
  primary key (user_id, topic_id)
);

-- 5) EGZERSİZ DENEMELERİ — her soru cevabı (XP, doğruluk, hata analizi için)
create table if not exists exercise_attempts (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  topic_id text references topics(id),
  dogru boolean,
  cevap text,
  beklenen text,
  created_at timestamptz default now()
);

-- 6) ORTAK ÇALIŞMA OTURUMLARI — "Düello" ekranındaki canlı oturum
create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  friendship_id uuid references friendships(id) on delete cascade,
  planlanan_saat time,              -- örn: 20:30
  gun_no int,                       -- PLAN30 gün no
  katilan_a boolean default false,
  katilan_b boolean default false,
  tarih date default current_date
);

-- 7) ÇEVRİMİÇİ DURUMU — Supabase Realtime Presence ile güncellenir, burada da yedeklenir
create table if not exists online_status (
  user_id uuid primary key references profiles(id) on delete cascade,
  son_gorulme timestamptz default now()
);

-- ══════════════════════════════════════════════════════════════
-- GÜVENLİK KURALLARI (Row Level Security)
-- Bir kullanıcı sadece KENDİ verisini ve arkadaşlık kurduğu kişinin
-- ilerleme/puan bilgisini görebilir — başka hiçbir kullanıcının verisine erişemez.
-- ══════════════════════════════════════════════════════════════
alter table profiles enable row level security;
alter table friendships enable row level security;
alter table user_topic_progress enable row level security;
alter table exercise_attempts enable row level security;
alter table study_sessions enable row level security;
alter table online_status enable row level security;

-- Herkes kendi profilini okuyup güncelleyebilir
create policy "kendi profilini gor" on profiles for select using (auth.uid() = id);
create policy "kendi profilini guncelle" on profiles for update using (auth.uid() = id);
create policy "kendi profilini olustur" on profiles for insert with check (auth.uid() = id);

-- Arkadaşlık: sadece taraf olduğun kayıtları görebilirsin
create policy "kendi arkadasligini gor" on friendships for select
  using (auth.uid() = user_a or auth.uid() = user_b);
create policy "arkadaslik olustur" on friendships for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- İlerleme: kendi verin + arkadaşının verisi görülebilir (Düello ekranı için gerekli)
create policy "kendi ilerlemeni gor" on user_topic_progress for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from friendships f
      where f.status = 'active'
        and ((f.user_a = auth.uid() and f.user_b = user_topic_progress.user_id)
          or (f.user_b = auth.uid() and f.user_a = user_topic_progress.user_id))
    )
  );
create policy "kendi ilerlemeni yaz" on user_topic_progress for insert with check (auth.uid() = user_id);
create policy "kendi ilerlemeni guncelle" on user_topic_progress for update using (auth.uid() = user_id);

-- Deneme kayıtları: sadece kendi verin
create policy "kendi denemeni gor" on exercise_attempts for select using (auth.uid() = user_id);
create policy "kendi denemeni yaz" on exercise_attempts for insert with check (auth.uid() = user_id);

-- Ortak oturum: arkadaşlığın tarafıysan görebilir/güncelleyebilirsin
create policy "ortak oturumu gor" on study_sessions for select
  using (exists (
    select 1 from friendships f where f.id = study_sessions.friendship_id
      and (f.user_a = auth.uid() or f.user_b = auth.uid())
  ));
create policy "ortak oturumu guncelle" on study_sessions for update
  using (exists (
    select 1 from friendships f where f.id = study_sessions.friendship_id
      and (f.user_a = auth.uid() or f.user_b = auth.uid())
  ));

-- Çevrimiçi durumu: arkadaşların görebilir
create policy "cevrimici durumu gor" on online_status for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from friendships f where f.status='active'
        and ((f.user_a=auth.uid() and f.user_b=online_status.user_id)
          or (f.user_b=auth.uid() and f.user_a=online_status.user_id))
    )
  );
create policy "kendi durumunu guncelle" on online_status for insert with check (auth.uid()=user_id);
create policy "kendi durumunu yaz" on online_status for update using (auth.uid()=user_id);

-- topics tablosu herkese açık okuma (hassas veri değil, sabit PDF konu listesi)
alter table topics enable row level security;
create policy "konulari herkes okuyabilir" on topics for select using (true);
