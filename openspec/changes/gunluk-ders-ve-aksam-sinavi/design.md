## Context

Motivasyon için `proposal.md` — Why bölümüne bakın. Burada yalnız yaklaşımı etkileyen mevcut durum ve kısıtlar var.

- **Tek dosya:** Uygulama `index.html` (8.314 satır, 564 KB), derleme adımı yok. Durum `localStorage`'da (`defaultDB`, `index.html:2113`). Ekranlar `ALL_SCREENS` listesinde kayıtlı ve `showScreen` ile açılıyor (`index.html:2928`, `2940`).
- **Konu omurgası zaten var:** `KONULAR` 44 giriş (`index.html:2982`); her giriş anlatım, kategori, gramer konusu, slayt ve alıştırma kimliklerine işaret ediyor, içerik kopyalamıyor. 41–44 numaralı girişler Kalan Üniteler/A2 kökenli; konu 14 (`Fiiller ve TMP sırası`, `index.html:2996`) Teil-1'in yarısı.
- **Gün mekanizması zaten var:** `PLAN30` (`index.html:4178`), `planBugun` (`index.html:4240`), `renderPlan30` (`index.html:4261`); tarih `DB.plan.bas` ile kayıyor.
- **Aralıklı tekrar zaten var:** `srsUpdate(key, correct, tricky)` (`index.html:2150`), `tick` (`index.html:2188`).
- **Sınav verisi:** `SINAV_HOREN` (`index.html:3493`) her soruda `teil` ve `konu` alanı taşıyor; `konu` değeri bir etiket (ör. `anons`), `KONULAR.no` değil.
- **Slayt kayıt defteri:** `SLIDE_DECKS` (`index.html:7620`) `openSlideDeck` ile açılıyor; slayttan sonra yazma testine geçiş de buna bağlı.
- **Kısıtlar:** İki kullanıcı (Android + iPhone); iOS'ta konuşma tanıma yok. `<meta viewport>` `viewport-fit` içermiyor ve `safe-area` hiç kullanılmıyor (`index.html:5`, eşleşme 0). Yeni build aracı, framework veya npm bağımlılığı eklenmez.

## Goals / Non-Goals

**Goals:**
- Kullanıcıyı "Bugün"e açıp tek adımda günün işine götürmek.
- Günü (ders + akşam sınavı) mevcut `KONULAR`, gün ve SRS mekanizmaları üzerinde kurmak; paralel sistem eklememek.
- Sınav sonuçlarını kaydedip zayıf konuyu dersin içine geri sokmak.
- Teil-2 konularını hocanın materyaline bağlı, kaynak etiketli olarak eklemek.
- İçeriği güvenli bir hat (NotebookLM → Perplexity → doğrulama → statik gömme) ile üretmek.

**Non-Goals:**
- Uygulamayı Duolingo tarzı bir oyunlaştırılmış yola çevirmek.
- Sunucu, anlık itme bildirimi (web push) veya Google hesabına uygulamadan erişim kurmak.
- Siteye canlı NotebookLM/Perplexity çağrısı koymak.
- Konuşma tanıma (iOS'ta yok).
- Mevcut modları silmek.
- Eski değişikliğin kelime bağlam cümleleri (görev 9–10), `typeDE` aşaması (8) ve gramer `wrongExp` (11) işleri; bunlar o değişiklikte kalır.

## Decisions

### Karar 1 — Alt menü: sabit bir çubuk, ekran kayıt listesine bağlı sekme haritası
Sekmeler (Bugün / Öğren / Sınav / Pratik) sabit bir alt çubuk olur. Her ekran kimliği bir sekmeye eşlenir (`ALL_SCREENS`'e paralel küçük bir harita); `showScreen` seçili sekmeyi bu haritadan boyar. Çubuk yalnız sekmelerin ana ekranlarında görünür; soru/sınav ekranlarında gizlenir (sınav ortasında yanlışlıkla sekme değişmesin). `viewport-fit=cover` meta'ya eklenir ve çubuk `env(safe-area-inset-bottom)` ile boşluk bırakır.
- *Alternatif — üstte sekme şeridi:* Başlıkla çakışır, iPhone'da başparmağa uzak. Reddedildi.
- *Alternatif — ana ekranı bölümlere ayırıp kaydırmak (bugünkü düzen):* Zaten sorun bu. Reddedildi.

### Karar 2 — Pratik sekmesi mevcut "Ek Çalışma" bloğunu aynen taşır
Bugünkü Ek Çalışma içeriği (`#ekWrap`, 25'e yakın kart) Pratik sekmesinin gövdesi olur; katlama kaldırılır. Dinleme/Yazma'nın ana ekranda iki kez görünmesi, girişin yalnız Sınav'a (Hören/Lesen/Schreiben) ve Pratik'e (serbest yazma) ayrılmasıyla bitirilir. Böylece eski kod silinmez, yalnız yeri değişir (kural: mevcut deseni yeniden kullan).

### Karar 3 — Gün tanımı `PLAN30`'un yapısını kullanır, ama ayrı bir anahtarda saklanır
Yeni program aynı biçimde (`{g, d, t, dk, b, k:[...]}`) bir dizi olur ve konulara `KONULAR.no` ile işaret eder. İlerleme `DB.plan` içine karışmaz: eski programın tamamlanma kayıtları (`DB.plan.tamam`) bozulmasın diye yeni program `DB.okul` altında kendi başlangıç tarihi ve tamamlanma haritasıyla tutulur. Program konu 1'den başlar: Teil-1 (1–25) → Kalan Üniteler (26–38, tam üniteler) → Teil-2. Toplam 44 konu, kullanıcının çerçevesi 1,5 ay (≈45 gün): neredeyse günde bir konu, tekrar günlerine az yer kalır. Bu yüzden bir güne birden çok hafif konu bağlanabilir (konu 1–7 çok hafif) ve yoğun konular bölünebilir.
- *Alternatif — `PLAN30`'u yerinde değiştirmek:* Kullanıcının mevcut 1–5. gün kayıtları yanlış konulara kayar. Reddedildi.

### Karar 4 — Teil-2 konuları `KONULAR`'ın sonuna eklenir; Kalan Üniteler tam ünite olur
Kalan Üniteler konuları (26–38) zaten `KONULAR`'da var; anlatımları (eski değişikliğin 3.5, 3.6) bu değişikliğe devralınır ve Teil-1 konularıyla aynı derinlikte yazılır. Teil-2 girişleri aşağıdaki gibi eklenir.
Yeni girişler 45'ten başlar; mevcut numaralar değişmez (kayıtlı SRS anahtarları `konu:<no>`). Girişler aynı alan kümesini kullanır (`ad`, `de`, `kaynak:{p:'t2', s}`, `anlatim`, `kat`, `gr`, `slayt`, `alis`). Konular: Genitiv Präpositionen, Zweiteilige Konjunktionen, Konjunktiv II, Plusquamperfekt, Futur I (mevcut `futur` slaytına bağlanır), Futur II. Kaynak başlıkları `icerik/temiz/teil2.txt` içinde satır 8, 301, 542, 939, 977'de.

### Karar 5 — Görsel ders sayfaları: mevcut slayt kayıt defterini yeni slayt türleriyle genişlet
Yeni "ders sayfası", `SLIDE_DECKS` içindeki desteler olarak kalır; mevcut `intro` / `outro` / kelime sayfası türlerine `sema` (renk kodlu cümle yapısı), `tablo` ve `zaman` (zaman çizgisi) türleri eklenir. Şemalar satır içi SVG/HTML ile çizilir; Almanca yazı gerçek metindir (seçilebilir, koyu temada okunur). Böylece `openSlideDeck`, slayttan-sonra-yazma geçişi (`twKey`) ve `KONULAR.slayt` bağları aynen çalışır.
- *Alternatif — ayrı bir "ders kitabı" ekranı ve veri biçimi:* Paralel sistem, iki yerde bakım. Reddedildi.
- *Alternatif — yapay zekâ ile üretilmiş görsel:* Görsel içindeki Almanca harfler sık bozuluyor; dilbilgisi kitabında tek harf hatası kabul edilemez. Yalnız yazısız süs illüstrasyonları için isteğe bağlı.

### Karar 6 — Sınav akışı: Teil bazlı sıra + sonuç geçmişi + `srsUpdate` ile geri besleme
`SINAV_HOREN` mevcut `teil` alanına göre gruplanır; her Teil kendi içinde karıştırılır, Teil'ler sırayla verilir (bugün hepsi birlikte karışıyor, `index.html:3783`). Her oturum `DB.sinavGecmis` listesine `{t, bolum, dogru, toplam, zayif:[...]}` olarak yazılır. Yanlış sorunun `konu` etiketi bir eşleme tablosuyla `KONULAR.no`'ya çevrilir ve `srsUpdate('konu:'+no, false)` çağrılır; zayıf konu ertesi günün başında kısa tekrar adımı olarak çıkar. Lesen için aynı desen. Deneme sınavı = Hören → Lesen → Schreiben zinciri, sonunda tek özet ekranı.
- *Bilinen boşluk:* `SINAV_HOREN.konu` etiketleri `KONULAR.no` değil; eşleme tablosu elle yazılır.

### Karar 7 — Akşam sınavı: yeni bir soru motoru değil, mevcut havuzlardan seçici
Sınav, o günün `KONULAR` girişlerinin `alis`/gramer sorularından, `srsUpdate` ile vadesi gelmiş maddelerden ve `DB.mistakes` içindeki yanlışlardan karma bir liste kurar ve mevcut gramer/MC sınav ekranını (`startGramerTest`, `index.html:6204`) kullanır. Tamamlanma `DB.okul.aksam['YYYY-AA-GG']` altında `{yapildi, ertelendi}` olarak saklanır.

### Karar 8 — 20:00 kapısı: açılışta kontrol, bir kez erteleme; hatırlatma her telefonda kendi takviminden
Uygulama açılışında yerel saat ≥ 20:00 ve o günün sınavı yapılmamışsa Bugün yerine sınav ekranı açılır; "Ertele" bir kez çalışır, ikinci açılışta kalkmaz. Hatırlatma uygulamada kurulmaz: "Takvime ekle" düğmesi `calendar.google.com/calendar/render?action=TEMPLATE` adresini `recur=RRULE:FREQ=DAILY`, `ctz=Europe/Istanbul`, ilk gün 20:00–20:30 (17:00 UTC) ile açar; **her telefon kendi olayını kendi Google hesabıyla kurar**, bu yüzden e-posta alışverişi gerekmez. İsteğe bağlı ortak davet/e-posta için uygulama, iki e-posta yazılı bir Google Apps Script betiği üretir (`CalendarApp.createEventSeries` + `addGuest` + `addPopupReminder`/`addEmailReminder`, günlük `MailApp.sendEmail` tetikleyicisi); kullanıcı betiği kendi hesabında çalıştırır, uygulama hesaba erişmez. Perplexity'ye göre `createEventSeries` davet gönderme seçeneği sunmaz (misafirler takvimin davet ayarına göre davet alır) ve hatırlatmalar kişiye özeldir; ücretsiz Gmail günlük e-posta kotası doğrulanmadı, betik görevinde kontrol edilir. E-postaları uygulamadan almak için `profiles` tablosuna e-posta sütunu ve karşı tarafın okuyabileceği bir kural gerekir (şu an yalnız kendi satırı okunabiliyor, `icerik/supabase/schema.sql:86`); yalnız iki taraf da onaylarsa.
- *Alternatif — `.ics` indirmesi:* iOS Takvim `VALARM`'ı genelde korur ama Google Takvim bunu güvenilir şekilde almıyor ve ortak bir davet oluşmuyor (Perplexity araştırması, bkz. proposal). Reddedildi.
- *Alternatif — web push (sunucu + abonelik):* Statik site, sunucu ve Supabase uç fonksiyonu gerektirir; iOS'ta yalnız ana ekrana eklenmiş uygulamada. Karmaşıklık/değer oranı kötü. Reddedildi.
- *Alternatif — Temmuz'da kurulan 20:00 bulut rutini:* Tetiklendi ama telefona ulaştığı doğrulanamadı. Tek başına güvenilmez; tamamlayıcı olarak kalabilir.
- Bildirimin zorlanamayacağı, takvim düğmesinin yanında bir notla söylenir.

### Karar 9 — Sınav soruları: resmî biçim, özgün metin
Akşam sınavı ve Hören/Lesen havuzu Goethe/telc/ÖSD A1 yapısını (Hören 3 bölüm/15 madde, Lesen 3/15, Schreiben 2 görev, 60 puan, geçme 36 — Perplexity özeti, resmî sayfadan doğrulanacak) örnek alır ama metinler özgün yazılır. Depo herkese açık ve Hören Teil 1 şu an Modellsatz'dan birebir (`index.html:3494`); bu sorular özgün sorularla değiştirilir. Git geçmişindeki eski commit (`ec8a74a`) silinemez; yalnız ileriye dönük temizlenir.
- *Alternatif — birebir kullanmaya devam:* Goethe belgesi "© Goethe-Institut" işaretli, çoğaltma izin ister. Reddedildi.
- *Alternatif — depoyu özel yapmak:* GitHub Pages ücretsiz planda herkese açık depo ister. Reddedildi.

### Karar 10 — Ders medyası: önce ölçüm, sonra depolama
NotebookLM podcast'i (ses özeti) ve diğer üretimler (flashcard, quiz, zihin haritası, rapor; `notebooklm-py` bunları üretip indirebiliyor) önce **tek örnekle** denenir: dil (Türkçe anlatım + Almanca örnekler), Almanca telaffuz kalitesi, dosya boyutu. Boyuta göre karar: küçükse depoda `icerik/ses/` ve servis çalışanı önbelleğinde; büyükse Supabase Storage (kota ölçülecek) ve çevrimiçi akış. Görsel üretimlerde Almanca yazı harf harf doğrulanmadan yayınlanmaz; bozuksa aynı şema kodla çizilir (Karar 5).
- *Alternatif — tüm konular için podcast'i depoya gömmek:* 33 konu × ses boyutu, depo ve PWA önbelleği şişirir; ölçülmeden karar verilmez.

### Karar 11 — Hedef sınav uygulama ayarıdır
Hedef sınav ve tarih `DB.okul.hedef` altında tutulur, ayar ekranından girilir ve ilk akşam sınavı sonunda sorulur; geri sayım Bugün'de görünür. Program değişmez, yalnız uyuşmazlık notu çıkar (hedef A1 iken B1 konusu; program hedeften sonra bitiyor).

### Karar 12 — İçerik hattı: çevrimdışı hazırlık, yerel araçlar, statik gömme
Her parti için sıra: (1) PDF örnek sayfasıyla NotebookLM okuma doğruluğu testi; (2) `notebooklm-py` ile kaynaktan anlatım/soru çıkarma, giriş kullanıcının tarayıcı penceresinde; (3) takılınca `_pplx.js` ile Perplexity; (4) çıktı, kaynak etiketli bir ara JSON'a yazılır; (5) ben ara dosyayı `index.html` biçimine çevirir ve gömerim; (6) `node --check` + `icerik/araclar/gece-testi.js`, `kapsama-testi.js`, `derin-kontrol.js` sıfır hata. Araçlar `icerik/araclar/` altında yaşar (mevcut klasör). `_pplx_profile/`, `_pplx.js` çıktıları ve ekran görüntüleri `.gitignore`'a eklenir.
- *Alternatif — Günlük otonom gece ajanı:* Tek dosyada sözdizimi hatası siteyi bozar, kullanıcı düzeltemez. Reddedildi.
- *Alternatif — Perplexity ücretli API:* Kullanıcı web yolunu seçti. Reddedildi.

## Risks / Trade-offs

- **[NotebookLM görsel/bozuk PDF sayfalarını yanlış okuyabilir]** → İlk adımda örnek sayfa testi; yanlışsa `icerik/temiz/*.txt` veya görsel okuma; okunamayan sayfadan kural uydurulmaz (spec: `b1-icerik`).
- **[Yapay zekâ kaynaklı Almanca dilbilgisi hatası]** → Her maddede kaynak etiketi; kritik kurallar Perplexity ile çapraz doğrulanır; `derin-kontrol.js`; önceki incelemede bulunan açıklama hataları sınıfı özellikle taranır.
- **[`notebooklm-py` resmî değil]** → Google değişirse bozulabilir; yalnız çevrimdışı hazırlıkta kullanılır, yayındaki siteyi etkilemez; giriş verisi depoya girmez.
- **[Google, otomasyon tarayıcısında girişi reddedebilir]** → Gerçek Edge/Chrome kanalı veya kullanıcının tarayıcı çerezi seçeneği.
- **[Teil-2 B1, hedef sınav A1 olabilir]** → Hedef ayarı + uyuşmazlık notu; program verisi ayrı bir dizi olduğu için sonradan yeniden sıralanabilir.
- **[44 konu / ≈45 gün: tekrar için az boşluk]** → Hafif konuları birleştirme, tekrar günleri, program hedef tarihten sonra bitiyorsa uyarı.
- **[33 konunun anlatımı yazılacak: hacim ve doğruluk]** → Parti parti, kaynak etiketli, NotebookLM çıktısı kaynakla karşılaştırılarak; dosya boyutu ölçülerek.
- **[Podcast: dil, telaffuz, boyut bilinmiyor]** → Tek örnek testi; olmazsa yazılı anlatımla devam (spec: `ders-medyasi`).
- **[Telif: depo herkese açık ve Goethe metni birebir yayında]** → Karar 9: özgün soru, birebirleri değiştir.
- **[Alt menü içeriği kapatır / iPhone çentiğiyle çakışır]** → İçerik alt boşluğu, `safe-area` ve `viewport-fit=cover`; iPhone'da ana ekran kipinde elle doğrulama (arkadaşın cihazı).
- **[`index.html` büyümesi]** → Şu an 564 KB; Teil-2 + görsel sayfalar sonrası ölçülür; eşik aşılırsa içeriğin ayrı bir veri dosyasına ayrılması ayrıca değerlendirilir (bu değişikliğin kapsamı dışı).
- **[Açılışta sınav kapısı kullanıcıyı sinirlendirir]** → Yumuşak varsayım (bir kez erteleme); kullanıcı sert kapı isterse tek koşul değişir.
- **[`SINAV_HOREN.konu` → `KONULAR.no` eşlemesi elle]** → Eşleme tablosu kapsama testiyle doğrulanır (eşlenmemiş etiket sayısı 0).
