# Supabase bağlantısı — kurulumdan sonra yapılacaklar

Bu klasördeki dosyalar **hazır ama henüz uygulamaya bağlanmamış.** Sebebi: gerçek
bir Supabase projesi olmadan bu kodu test etmenin imkanı yok, test edilmemiş ağ
kodunu canlı uygulamaya eklemek riskli.

## Senin yapman gereken (tek seferlik)

1. https://supabase.com/dashboard/sign-up → GitHub ile giriş
2. New Project → isim `almanca-duo`, bölge **Frankfurt (eu-central-1)**, bir parola üret ve not al
3. Proje açılınca sol menüden **SQL Editor** → `schema.sql` dosyasının TAMAMINI yapıştır → **Run**
   (bu, 7 tabloyu ve güvenlik kurallarını tek seferde kurar)
4. **Project Settings → API** sayfasından şu ikisini kopyala:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** anahtarı (uzun bir metin)
5. Bu ikisini bana ver — `service_role` anahtarına hiç dokunma, o tüm veritabanına sınırsız erişim demek.

## Bana verdikten sonra benim yapacaklarım

1. `client.js` içindeki `SUPABASE_URL` ve `SUPABASE_ANON_KEY` değerlerini doldurmak
2. `index.html`'e Supabase CDN script'ini ve bu dosyayı bağlamak
3. Giriş ekranı eklemek (ikiniz için ayrı hesap)
4. Düello ekranını gerçek veriyle çalışır hale getirmek: ortak ilerleme, çevrimiçi
   göstergesi, ortak oturum katılımı
5. Her adımdan sonra Playwright ile test edip, hatasız olduğunu doğrulayıp commit/push etmek

## Dosyalar

- `schema.sql` — 7 tablo (profiles, friendships, topics, user_topic_progress,
  exercise_attempts, study_sessions, online_status) + güvenlik kuralları
  (herkes sadece kendi verisini ve arkadaşının izin verilen verisini görebilir)
- `client.js` — bağlantı fonksiyonları (giriş, ilerleme kaydet, arkadaş verisi oku,
  çevrimiçi durumu, ortak oturuma katıl) — hepsi `sbHazirMi()` ile korunur, anahtar
  girilmeden hiçbir fonksiyon hataya düşmez, sessizce "henüz bağlı değil" döner.
