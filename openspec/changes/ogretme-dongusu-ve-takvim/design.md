## Context

Gerekçe için bkz. `proposal.md`. Davranış sözleşmesi için bkz. `specs/`.

Tasarımı şekillendiren kısıtlar ve yeni bilgiler:

- **Tek dosya, derleme yok.** Tüm uygulama `index.html` içinde (456 KB). Paket yöneticisi, framework veya derleme adımı yok.
- **Kaynak okunabilir — doğrulandı.** `icerik/araclar/sayfa-cek.js` (Playwright + pdf.js) PDF sayfasını PNG'ye çeviriyor. Teil-1 sayfa 4-5 okundu: tam alfabe + IPA, `ei/ie/au/eu`, `ch/sch/st/sp`, `ss/ß`, `tz`, `ck`, `ph` kuralları, sınıf kalıpları. Yani kayıp anlatım üretilecek değil, **taşınacak** içeriktir.
- **Konu → sayfa eşlemesi zaten var.** `PLAN30` gün maddeleri `[no, "Başlık", kaynak, "sayfa"]` biçiminde; hangi konunun hangi PDF sayfasında olduğu burada kayıtlı. Yeni bir eşleme çıkarmaya gerek yok.
- **Mevcut içerik silinmeyecek.** 21 gramer kural kartı, 16 kelime kategorisi, 5 animasyonlu slayt, 7 yazma grubu, oyunlar — hepsi çalışıyor ve değerli. Sorun içeriğin yokluğu değil, **dağınıklığı**.
- **Animasyonlu anlatım yerleşik yetenek.** Uygulamada 5 slayt destesi saf HTML/CSS/SVG ile yapılmış; dış araç kullanılmadı. Yeni anlatımlar aynı desenle üretilir.
- **İki cihaz.** Android Chrome + iOS Safari. `speechSynthesis` ikisinde de var, `SpeechRecognition` iOS'ta yok.

## Goals / Non-Goals

**Goals:**

- 38 konunun her birine hocanın materyalinden gelen anlatım kazandırmak
- Dağınık içeriği konu omurgasında toplamak — mevcut hiçbir şeyi kaybetmeden
- Günlük akışı tek başına yeterli hale getirmek
- Sınavın üç bölümünü (Hören · Lesen · Schreiben) programa yerleştirmek

**Non-Goals:**

- Dosya bölme / modül sistemi — tek dosya kısıtı korunur
- Üçüncü taraf araçlara (NotebookLM, Adobe Firefly) tarayıcıyla bağlanmak — hesap kimlik bilgisi gerektirir ve kaynak doğrudan okunabildiği için gereksizdir
- Telaffuz / konuşma tanıma — iOS'ta çalışmıyor
- B1 içeriği (`Teil-2.pdf`) — hedef A1/A2
- Mevcut modların silinmesi — taşınır, silinmez

## Decisions

### Karar 1 — `KONULAR` omurgası eşleme katmanıdır, kopya değil

38 konuluk yeni bir dizi eklenir. Her konu, var olan içeriğe **kimlikle işaret eder**; içeriği kopyalamaz:

```
{ no:1, ad:'Das Alphabet', kaynak:{pdf:'teil1', sayfa:'4-6'},
  anlatim:'alfabe',            // yeni anlatım kimliği
  kategori:null,               // CATS kategorisi (varsa)
  gramer:null,                 // GRAMER_TOPICS id (varsa)
  slayt:null,                  // animasyonlu slayt (varsa)
  alistirma:['dinleme:alfabe'] // bu konuya uygun egzersiz tipleri
}
```

*Neden:* İçeriği taşımak veya kopyalamak hem 456 KB'lik dosyada büyük bir yeniden yazım hem de mevcut çalışan özellikleri kırma riski. İşaret etmek, mevcut `GRAMER_TOPICS` / `CATS` / slayt dizilerine dokunmadan düzen kurar.

*Değerlendirilen alternatif:* Her şeyi `KONULAR` içine taşımak — reddedildi; kazancı yok, riski yüksek.

### Karar 2 — Anlatım hocanın sayfasından okunarak yazılır

Her konu için `PLAN30`'daki sayfa aralığı `sayfa-cek.js` ile PNG'ye çevrilir, görsel olarak okunur ve anlatım HTML'e dönüştürülür. Mevcut `rule` kart deseni (tablo + `r-tip` ipucu) kullanılır; karmaşık konularda mevcut slayt deseni kullanılır.

*Neden:* Hocanın vurguladığı kural ve istisnalar sınavda çıkacak olanlar. Genel bir A1 kaynağından yazmak kaynakla çelişme riski taşır.

*Kabul edilen sınır:* 38 konunun sayfaları tek tek okunacak; bu işin büyük kısmı burada. Görevler konu gruplarına bölünür ki yarım kalma riski azalsın.

### Karar 3 — Anlatım biçimi konuya göre seçilir

| Konu tipi | Biçim | Gerekçe |
|---|---|---|
| Tablo/çekim ağırlıklı (sein, artikel, Perfekt) | Kural kartı — mevcut `rule` deseni | Tablo en okunaklı sunum |
| Mantık/ayrım ağırlıklı (Dativ vs Akkusativ, weil/denn) | Animasyonlu slayt — mevcut slayt deseni | Adım adım gösterim gerekiyor |
| Telaffuz/ses ağırlıklı (alfabe, e-posta) | Kural kartı + dinleme egzersizi | Ses olmadan öğretilemez |
| Kelime ağırlıklı (renkler, kıyafet, aile) | Kısa kart + kategori | Anlatımdan çok dağarcık işi |

### Karar 4 — Alıştırma tipi konudan türetilir

Her konunun `alistirma` alanı, o konuda hangi egzersizin çalışacağını belirtir: edat konusunda edat egzersizi, artikel konusunda der/die/das, çoğul konusunda çoğul yapma, kelime konusunda o kategorinin kelime egzersizi.

*Neden:* Kullanıcının isteği birebir buydu — "birinci slaytta bunlar olmalı, orada edat egzersizleri olmalı, der-die-das olmalı, çoğul yapma olmalı". Egzersizler zaten var; eksik olan hangisinin hangi konuya ait olduğu bilgisi.

### Karar 5 — Ana ekran üç bölüme iner, hiçbir mod silinmez

```
┌─────────────────────────────┐
│ BUGÜN · Gün 7 / 30          │  ← günün konuları, adım adım
│ Dün: Die Farben ✓           │
│ Yarın: Die Kleidung         │
├─────────────────────────────┤
│ KONULAR (38)                │  ← liste, her birinin durumu
│ ✓ tamamlandı · ◐ devam      │
│ ○ başlanmadı · ↻ tekrar     │
├─────────────────────────────┤
│ ▸ EK ÇALIŞMA (katlanmış)    │  ← mevcut 17 mod, gruplanmış
└─────────────────────────────┘
```

Mevcut modlar silinmez; "Ek Çalışma" altında türlerine göre gruplanır (kelime · gramer · oyun · yazma). Varsayılan olarak katlanmış gelir ki günlük akış öne çıksın.

*Neden:* Kullanıcının şikâyeti modların varlığı değil, **karışıklığı**. Katlamak hem karışıklığı giderir hem hiçbir şeyi kaybetmez.

### Karar 6 — Konu durumu mevcut SRS motoruyla izlenir

Anahtar şeması `konu:<no>`. Mevcut `srsUpdate`, `SRS_INTERVALS`, `DB.srs` aynen kullanılır.

*Neden:* `DB.srs` string anahtar kabul ediyor ve kelime dışı içerik için zaten kullanılıyor (`'edat:'+x`, `artKey(n)`, `plKey(q)`). İkinci bir tekrar sistemi kurmak iki ayrı takvim ve iki ayrı hata kaynağı demek.

*Göç gerekmez:* Yeni `konu:` anahtarları sözlüğe eklenir; mevcut anahtarlar değişmez.

### Karar 7 — Dinleme sesi tarayıcı seslendirmesinden üretilir

`speechSynthesis` ile `de-DE`; kayıtlı ses dosyası eklenmez. Soru havuzu mevcut doğrulanmış cümlelerden kurulur (`YAZMA_TEXTS` 54 cümle, `CATS` içindeki `s:` cümleleri, bağlam cümleleri, okuma paragrafları).

*Neden:* Kayıtlı ses için kaynak ve seslendiren yok; 100+ ses dosyası depo ve çevrimdışı önbellek boyutunu şişirir, her içerik değişiminde yeniden kayıt gerekir.

*Kabul edilen sınır:* Sentetik ses gerçek sınav kaydından nettir ve kolaydır. Dinleme becerisini olduğundan iyi gösterebilir.

### Karar 8 — Almanca üretim aşaması eklenir, Türkçe yazma kaldırılmaz

Zincir `mc → type(TR) → mcrev → typeDE → [cümle] → done` olur; `type(TR)` eşiği 2'den 1'e iner ki döngü aşırı uzamasın.

Yazım toleransı kademeli: umlaut / `ß`↔`ss` / büyük-küçük harf farkı **kabul edilir ve doğrusu vurgulanır**; isimde yanlış veya eksik artikel **reddedilir** — `der/die/das` sınavda ölçülüyor, burada tolerans göstermek öğretmek istediğimiz şeyi ölçmemek olur.

### Karar 9 — Bağlam için ucuz `b:` alanı, zengin `s:` korunur

Mevcut `s:` tam bir egzersiz (`{tr, chunks[], blankIdx[], blankOptions[]}`) ve 324 kelime için yazmak bu değişikliği tek başına aşar. Yeni ince alan eklenir:

```
b: { de:"Der Zug fährt um 8 Uhr ab.", tr:"Tren saat 8'de hareket ediyor." }
```

`b:` pasiftir — tanıtım kartında ve yanlış cevap geri bildiriminde gösterilir. Olan 34 kelimede `s:` çalışmaya devam eder; `b:` değerleri mevcut `chunks`'tan türetilir, yeniden yazılmaz.

*Değerlendirilen alternatif:* Cümleleri otomatik üretmek — reddedildi; dilbilgisi hatalı Almanca cümle cümlesizlikten kötüdür.

### Karar 10 — Kapsama kodla denetlenir

`icerik/araclar/kapsama-testi.js`: her konunun anlatımı var mı, her gün bir konuya bağlı mı, her bağlantı çalışıyor mu, `b:` ve `wrongExp` eksikleri ne.

*Neden:* 38 anlatım, 324 cümle ve 318 açıklama elle gözden geçirilemez. "Hepsi eklendi" doğrulanabilir olmalı.

## Risks / Trade-offs

**38 konunun sayfalarını okuyup anlatıma çevirmek işin en büyük kısmı; yarım kalırsa kullanıcı yine eksik konuyla karşılaşır** → Görevler konu gruplarına bölünür, her grup sonrası kapsama testi çalıştırılır. Anlatımı henüz yazılmamış konu, listede "hazırlanıyor" olarak işaretlenir — sessizce boş ekran gösterilmez.

**Ana ekranı yeniden düzenlemek çalışan bağlantıları kırabilir** → Mevcut fonksiyonlar silinmez, yalnız yerleri değişir. Her adımda `gece-testi.js` çalıştırılır; o test 31 takvim bağlantısını ve tüm modların açılışını zaten denetliyor.

**Dosya 456 KB'den ~600 KB'ye çıkar** → Service worker önbelleğe aldığı için tekrar açılışlar etkilenmez; ilk açılış mobil veride yavaşlar. 700 KB aşılırsa veri ayırma yeniden değerlendirilir.

**Sentetik ses gerçek sınav kaydından kolay** → Yavaş/normal hız sunulur, normal varsayılan olur; kullanıcıya bunun alıştırma sesi olduğu belirtilir.

**Cihazda Almanca ses yüklü olmayabilir** → Mod açılmadan Almanca ses varlığı denetlenir; yoksa mod açılmaz ve sebebi Türkçe açıklanır.

**Hocanın slaytı okunurken yanlış okunabilir (ekran kaydı, fare imleci, düşük çözünürlük)** → Yanlış öğretmek öğretmemekten kötüdür. Şüpheli yerlerde sayfa daha yüksek ölçekle yeniden çekilir; okunamayan bir kural uydurulmaz, o bölüm atlanır ve not düşülür.

**Konu döngüsü uzadığı için oturum başına daha az kelime işlenir** → `LEARN_BATCH_SIZE` (6) test sonrası gözden geçirilir.

## Migration Plan

Veri göçü gerekmez — tüm değişiklikler `localStorage` şemasına eklemelidir:

- `DB.srs` sözlüğüne `konu:<no>` ve `gr:<topicId>` anahtarları eklenir; mevcut anahtarlar değişmez
- `CATS` kelimelerine `b:` eklenir; eksikse tanıtım kartı bugünkü davranışını sürdürür
- `GRAMER_TOPICS` sorularına `wrongExp` eklenir; eksikse geri bildirim bugünkü `exp:` davranışına düşer
- `PLAN30` gün maddeleri konuya işaret eder; eski `DB.plan.tamam` kayıtları korunur

Geri alma: değişiklik commit'leri geri alınabilir; kullanıcının kayıtlı ilerlemesi etkilenmez çünkü yeni anahtarlar okunmadığında göz ardı edilir.

Yayın: `sw.js` içindeki `CACHE` sürümü güncellenmeli, yoksa kullanıcılar eski sürümü görür. GitHub Pages'e push edilmeden değişiklik telefonda görünmez.
