-- ══════════════════════════════════════════════════════════════
-- E-posta paylaşımı (isteğe bağlı) — ortak takvim daveti ve günlük e-posta kurulumu için
-- Supabase Dashboard → SQL Editor → bu dosyanın TAMAMINI yapıştır → Run.
--
-- ÖNEMLİ GÜVENLİK NOTU
--   Uygulamada herkese açık "Kayıt Ol" ekranı var. Kural şu: bir kullanıcının e-postasını yalnızca,
--   kendisi de e-posta paylaşımını AÇMIŞ başka bir giriş yapmış kullanıcı okuyabilir (karşılıklı onay).
--   Yine de yabancı biri hesap açıp paylaşımı açarsa okuyabilir. İkiniz de hesabınızı açıp paylaşımı
--   kullandıktan sonra: Supabase → Authentication → Sign In / Providers → Email →
--   "Allow new users to sign up" seçeneğini KAPAT. Böylece yeni kimse kayıt olamaz.
-- ══════════════════════════════════════════════════════════════

alter table profiles add column if not exists email text;
alter table profiles add column if not exists email_paylas boolean default false;

-- Karşılıklı onay: ikisi de paylaşımı açmışsa birbirinin satırını okuyabilir
drop policy if exists "paylasilan e-posta gorunur" on profiles;
create policy "paylasilan e-posta gorunur" on profiles for select
  using (
    auth.uid() = id
    or (
      email_paylas = true
      and exists (select 1 from profiles ben where ben.id = auth.uid() and ben.email_paylas = true)
    )
  );
