## Why

Uygulamayı yapan kişi bile "ne nerede, bugün ne yapacağım" sorusuna cevap bulamıyor ve hiçbir günlük çalışmayı başlatamamış; baştan, düzenli çalışmak istiyor. Sebep somut: ana ekran (`index.html:1108`) 29 tıklanabilir girişe sahip tek uzun sayfa, uygulamada 48 ekran var (`ALL_SCREENS`, `index.html:2928`), alt menü yok (`#hdrBack` tek gezinme ögesi, `index.html:1089`). Aynı yere birden çok kapıdan girilebiliyor: Dinleme ve Yazma ana ekranda ikişer kez geçiyor. Sınav kısmı mantıklı ilerlemiyor: `startDinleme` 21 sorudan rastgele 10 tanesini alıp Teil 1/2/3'ü karıştırıyor (`index.html:3783`), `showHorenDone` sonucu kaydetmiyor (`index.html:3893`), Hören/Lesen/Schreiben üç bağımsız quiz.

Anlatım tarafı da eksik: `KONULAR` 44 giriş (`index.html:2982`) ama eski değişikliğin görev listesine göre yalnız konu 1–11'in anlatımı yazılmış (`ogretme-dongusu-ve-takvim/tasks.md` 3.1, 3.2 işaretli; 3.3–3.6 açık). Konu 12–38'in anlatımı ve B1 (Teil-2) içeriği yok. Kullanıcı özet kart değil, konuyu gerçekten anlatan, detaylı ve yaratıcı (podcast, görsel, egzersiz) bir ders istiyor.

## What Changes

- **Açılış ve gezinme:** Uygulama "Bugün" ekranına açılır; tek büyük "Devam et" düğmesi günün sıradaki adımını açar. Dört sekmeli alt menü: **Bugün / Öğren / Sınav / Pratik**. Mevcut modlar silinmez, "Pratik" sekmesine taşınır. Alt menü iPhone ana ekran kipinde güvenli alana uyar (`index.html`'de `viewport-fit` ve `safe-area` eşleşmesi 0).
- **Okul günü formu:** Bir gün = gün içi ders (anlatım → egzersiz, gerektiğinde podcast) + akşam sınavı. Oyunlaştırılmış yol değil; hocanın materyali ve sınav odaklı bir akış.
- **Müfredat — baştan, tam üniteler:** Program konu 1'den başlar: Teil-1 (konu 1–25) → Kalan Üniteler (A1 konu 26–38, **tam üniteler**, kart değil) → Teil-2 (B1: Genitiv Präpositionen, Zweiteilige Konjunktionen, Konjunktiv II, Plusquamperfekt, Futur I/II). Toplam 44 konu; kullanıcının koyduğu çerçeve 1,5 ay. Konu 1–11'in anlatımı hazır; konu 12–38 ve Teil-2 yazılacak. Eski değişikliğin 3.3–3.6 görevleri bu değişikliğe devredilir.
- **Akşam sınavı (20:00):** O güne kadar işlenen konulardan ve zayıf kalanlardan oluşur. Sorular **resmî sınav biçiminde özgün olarak yazılır** (Goethe/telc/ÖSD A1 yapısı); resmî Modellsatz metni tekrar yayınlanmaz. Uygulama içinde 20:00'den sonra açılışta önce sınav çıkar (**varsayım:** yumuşak kapı, bir kez ertelenebilir).
- **Hatırlatma:** Her telefon "Takvime ekle" ile kendi Google hesabında günlük tekrarlayan 20:00 olayını kurar (kendi e-postasıyla, e-posta alışverişi gerekmez). İsteğe bağlı: e-postalar uygulamadan alınıp hazır doldurulmuş bir Google Apps Script verilir; kullanıcı kendi Google hesabında çalıştırınca hem ortak davetli olay hem günlük e-posta kurulur. Telefondaki açılır bildirim kişinin kendi takvim ayarıdır, uygulamadan zorlanamaz; bu uygulamada notla söylenir.
- **Hedef sınav ve tarih uygulama içinde ayarlanır:** Ayar ekranı + ilk akşam sınavının sonunda sorulur; Bugün'de geri sayım gösterilir.
- **Zengin ders medyası (NotebookLM):** Konu başına podcast (sesli özet), flashcard, quiz, zihin haritası ve rapor/çalışma kılavuzu üretilir ve ders sayfalarına bağlanır. Podcast'in dili, Almanca kelime telaffuzu ve dosya boyutu önce tek örnekle test edilir; depoda mı yoksa harici depolamada mı duracağı ölçüme göre karar verilir.
- **Goethe sınav akışı düzeltmesi:** Teil 1 → Teil 2 → Teil 3 sıralı akış, sonuç geçmişi (bugün hiç yok), zayıf konunun ertesi günün dersine dönmesi.
- **Görsel ders kitabı sayfaları:** Konu başına sayfa sayfa gezilen anlatım; şema, tablo ve fiil-sırası okları kodla (SVG/HTML) çizilir, çünkü yapay zekâ görsel araçları görsel içindeki Almanca yazıyı sık bozuyor. İlk konu seti: bağlaçlar (weil / denn / dann / deshalb / weshalb / deswegen / darum / dass / obwohl / wenn–als) ve Präteritum (düzenli + düzensiz).
- **İçerik hattı:** Önce NotebookLM, takılınca Perplexity (Playwright). Siteye canlı NotebookLM/Perplexity bağlantısı eklenmez; içerik önceden hazırlanıp statik gömülür ve her maddede kaynağı yazar. Gece otonom ekleme yok.
- **Telif düzeltmesi (mevcut sorun):** Depo herkese açık (GitHub Pages, `gh repo view`: PUBLIC) ve Hören Teil 1 soruları Goethe Modellsatz'dan "birebir" alınmış (`index.html:3494`); Goethe belgesi "© Goethe-Institut" ile işaretli. Bu sorular özgün sorularla değiştirilir.

## Capabilities

### New Capabilities
- `acilis-ve-gezinme`: Bugün'e açılış, "Devam et" düğmesi, 4 sekmeli alt menü, mevcut modların Pratik'e taşınması, iOS güvenli alan.
- `okul-gunu-akisi`: Bir günün ders ve akşam sınavı olarak tanımı; konu 1'den başlayan müfredat; günün durumu ve yarım kalan günün devamı.
- `aksam-sinavi`: 20:00 sınavının içeriği ve özgün soru kaynağı, uygulama içi kapı, takvim ve e-posta hatırlatması.
- `hedef-sinav`: Hedef sınav türü ve tarihinin uygulama içinde ayarlanması, geri sayım, program uyarısı.
- `sinav-akisi`: Sıralı Teil akışı, Hören/Lesen/Schreiben sonuç geçmişi, zayıf konunun derse geri dönmesi.
- `b1-icerik`: Teil-2 müfredatı (Genitiv Präpositionen, Zweiteilige Konjunktionen, Konjunktiv II, Plusquamperfekt, Futur I/II) ve Kalan Üniteler'e bağlantı.
- `gorsel-ders-sayfasi`: Şemalı, kodla çizilen, sayfa sayfa konu anlatımı.
- `ders-medyasi`: NotebookLM'den üretilen podcast, flashcard, quiz, zihin haritası ve raporun ders sayfalarında kullanımı.
- `icerik-hatti`: NotebookLM → Perplexity → statik içerik; kaynak etiketi, doğrulama, telif sınırı, git'e girmeyecek yerel dosyalar.

### Modified Capabilities
<!-- openspec/specs/ boş: yayınlanmış spec yok, değişen mevcut gereksinim yok. -->

## Impact

- **`index.html`** (8.314 satır, 564 KB, tek dosya): ana ekran (`index.html:1108`), `showScreen` / `ALL_SCREENS` (`index.html:2940`, `2928`), `KONULAR` (`index.html:2982`), `PLAN30` (`index.html:4178`), sınav akışı (`index.html:3669`–`3900`) ve `SINAV_HOREN` (`index.html:3493`), `defaultDB` / `srsUpdate` (`index.html:2113`, `2150`), `CHANGELOG` (`index.html:4366`) etkilenir. 33 konunun (12–38 + Teil-2) anlatımı eklenince dosya büyür; ölçüm gerekir. Tek dosyada sözdizimi hatası siteyi bozar; her aşamada `node --check` ve `icerik/araclar/gece-testi.js` çalıştırılır.
- **Açık değişiklik `ogretme-dongusu-ve-takvim` (22/82) ile çakışma:** Bu değişiklik, eski değişikliğin ana ekran düzeni (6.1–6.5) ve konu anlatımları (3.3–3.6) görevlerini devralır; kelime bağlam cümleleri (9–10), `typeDE` (8), gramer `wrongExp` (11) orada kalır. Eski değişikliğin dinleme görevleri (7.x) Hören modülü yayınlandığı için bayat.
- **Supabase:** `profiles` tablosunda yalnız kendi profil satırı okunabiliyor (`icerik/supabase/schema.sql:86`); e-posta paylaşımı yapılacaksa tabloya e-posta sütunu ve karşı tarafın okuyabileceği bir kural gerekir (isteğe bağlı Apps Script yolu için). Podcast depolaması için Supabase Storage bir adaydır (kota ölçülecek).
- **Yeni yerel araçlar:** `notebooklm-py` (pip, Python 3.14'te kurulabilir göründü; giriş kullanıcının tarayıcı penceresinde); Perplexity için `_pplx.js`, `_pplx_giris.js`, `_pplx_profile/` — `.gitignore`'a eklenmeli (şu an listede yok).
- **Dış bağımlılık:** Google Calendar şablon bağlantısı; isteğe bağlı kullanıcı hesabında çalışan Google Apps Script. Uygulama Google hesabına erişmez.
- **Açık sorular:** Hedef sınav ve tarihi uygulama içinde girilecek (bu yüzden artık bloklayıcı değil). Podcast boyutu, dili ve Almanca telaffuz kalitesi test edilene kadar bilinmiyor.
