## Why

Uygulamada **konu anlatımı yok denecek kadar az, ve olan da dağınık.** Sebebi ölçüldü:

Hocanın PDF'inden yalnız **içindekiler listesi** alınmış. `teil1.txt` sayfa 3'teki 38 konuluk liste `PLAN30` takvimine dönüşmüş, ama konuların **asıl anlatımı hiç içeri alınmamış** — çünkü 570 sayfanın 249'u tamamen görsel (canlı ders ekran kaydı) ve metin çıkarımı boş dönüyor. Uygulamadaki 21 gramer kural kartı PDF'ten değil, ayrıca yazılmış; bu yüzden 38 konuyla birebir örtüşmüyor.

Sonuç: **38 konunun 12'sinin hiçbir karşılığı yok** (Das Alphabet, Hallo! Hi!, Wie geht es Ihnen?, Wie heißen Sie?, Tschüs! Bye!, Die E-Mail-Adresse, Wo wohnen Sie?, Woher kommen Sie?, Die Länder/Die Sprachen, Ihre Information, Die Artikel/Genitiv, Demonstrativpronomen). Takvim bu günlerde "Teil-1 sayfa 4-6" yazıyor, ama PDF telefonda yok — kullanıcı o gün hiçbir şey yapamıyor.

Kalan 26 konunun karşılığı da tek bir yerde değil: kimi gramer konusu, kimi kelime kategorisi, kimi slayt, kimi YS Hub'da. Ana ekranda 17 ayrı giriş noktası var ve hangisinin hangi konuya ait olduğu belli değil. Kullanıcının ifadesiyle: *"ne nerede onu iyi anlayayım."*

**Yeni bulgu:** Hocanın görsel sayfaları Playwright + pdf.js ile okunabiliyor (doğrulandı — Teil-1 sayfa 4-5 okundu: tam alfabe, IPA telaffuz, `ei/ie/au/eu`, `ch/sch/st/sp`, `ss/ß`, `tz`, `ck`, `ph` kuralları ve sınıf kalıpları). Yani kayıp anlatım **üretilmesi** değil, **içeri alınması** gereken bir şey.

## What Changes

**1. Konu anlatımları hocanın kendi materyalinden içeri alınır**
38 konunun her biri için ilgili PDF sayfaları görsel olarak okunur ve anlatım uygulamaya yazılır. Eksik 12 konu sıfırdan değil, hocanın slaytından gelir. Mevcut 21 kural kartı korunur ama 38 konuluk omurgaya bağlanır.

**2. Omurga "konu" olur — her konu tam bir ünite**
Bugün bir konunun parçaları dört ayrı yere dağılmış durumda. Bundan sonra her konu tek bir yerde şu sırayla çalışılır:

```
KONU
 ├── 1. Anlatım      (hocanın slaytından — kural, örnek, telaffuz)
 ├── 2. Kelimeler    (o konunun kelimeleri, bağlam cümlesiyle)
 ├── 3. Alıştırma    (o konuya uygun egzersiz tipleri)
 └── 4. Test         (konu bitti mi — sonuç tekrara girer)
```

**3. Takvim konuya işaret eder, PDF sayfasına değil**
47 konu maddesinin 16'sında (%34) çalıştırılabilir egzersiz yok; gün 1, 2, 5 ve 18 tamamen boş. Her gün artık bir veya daha fazla **konuya** bağlanır ve o konunun dört adımı o gün yapılır.

**4. Ana ekran sadeleşir — ne nerede belli olur**
17 dağınık giriş noktası yerine üç bölüm: **Bugünün dersi** · **Konular** (38'lik liste, durumuyla) · **Serbest çalışma** (mevcut oyun/egzersiz modları, katlanmış halde). Mevcut modların hiçbiri silinmez, konunun içine ve serbest çalışmaya taşınır.

**5. Öğretme döngüsündeki üç boşluk kapatılır**
- **Almanca üretimi yok:** `checkType` ([index.html:3528](../../../index.html#L3528)) kullanıcının yazdığını `w.tr` ile karşılaştırıyor — "yazma testi" Türkçe yazdırıyor. Kullanıcı hiçbir aşamada aklından Almanca yazmıyor. Almanca yazdıran aşama eklenir.
- **Bağlam yok:** 358 kelimenin 34'ünde (%9) örnek cümle var; `pickMCRev`'de `w.s` yoksa `phase='done'` olduğu için cümle aşaması %91 ölü. Her kelimeye bağlam cümlesi eklenir.
- **Yanlış açıklanmıyor:** 106 gramer sorusunun 106'sında `exp:` (doğruyu açıklar), 0'ında `wrongExp` var. Oysa Edat modülünde 25/25 soruda var. Desen 106 soruya yayılır.

**6. Dinleme (Hören) egzersizi eklenir**
Sınavın 1/3'ü. `speechSynthesis` üç yerde çalışıyor ama üçünde de **metin ekranda açıkken** — bu okuma desteği, dinleme sınavı değil. Metni gizleyen gerçek dinleme modu eklenir.

**7. Gramer tekrara girer**
`srsUpdate` bugün yalnız kelime, edat, artikel ve çoğul için çağrılıyor; 21 gramer konusu bir kez çözülüp bırakılıyor. Konular mevcut Leitner kutularına bağlanır.

**Kapsam dışı:** Telaffuz / konuşma tanıma — `SpeechRecognition` iOS Safari'de çalışmıyor, kullanıcının arkadaşı iPhone kullanıyor. NotebookLM gibi üçüncü taraf araçlara tarayıcıyla girmek — kullanıcının Google hesabına şifreyle girmeyi gerektirir ve gereksiz; kaynak PDF doğrudan okunabiliyor. B1 içeriği (`Teil-2.pdf`) — hedef A1/A2.

## Capabilities

### New Capabilities
- `konu-anlatimi`: 38 konunun her birinin, hocanın kendi materyalinden gelen anlatımının bulunması ve kullanıcıya gösterilmesi.
- `konu-akisi`: Bir konunun tam ünite olarak çalışılması — anlatım, kelime, alıştırma, test sırası ve konunun tamamlanma/tekrar durumu.
- `uygulama-duzeni`: Kullanıcının "ne nerede" sorusunu cevaplayabilmesi — ana ekran bölümleri, konu listesi ve her içeriğin tek bir yere ait olması.
- `dinleme-egzersizi`: Metni görmeden sesten anlama — ses çalma, cevap alma, sonra metni açma.
- `kelime-ogrenme-dongusu`: Kelime aşamalarının sırası — Almanca üretim aşaması ve her kelimenin bağlam cümlesi dahil.
- `gramer-ogrenme`: Gramer sorularında yanlış şıkkın neden yanlış olduğunun açıklanması ve gramer konularının aralıklı tekrara girmesi.
- `gunluk-program`: 30 günlük takvimin konulara bağlanması ve uygulama içeriğinin tamamının programda yer alması.

### Modified Capabilities
<!-- openspec/specs/ boş — bu projedeki ilk değişiklik, yayınlanmış spec yok. -->

## Impact

- **Kaynak okuma:** `icerik/araclar/sayfa-cek.js` (yeni, çalışır durumda) PDF sayfalarını PNG'ye çevirir; 38 konunun sayfaları okunup anlatıma dönüştürülür. Yeni bağımlılık yok — Playwright zaten kurulu, pdf.js CDN'den.
- **`index.html`** — tek dosya, tüm değişiklikler burada:
  - **Yeni** `KONULAR` omurgası: 38 konu, her biri anlatım + kelime + alıştırma + test bağlarıyla
  - `GRAMER_TOPICS` — 21 kural kartı korunur, konulara bağlanır; 106 soruya `wrongExp` eklenir
  - `CATS` — kelimeler konulara bağlanır, her kelimeye bağlam cümlesi eklenir
  - `PLAN30` — gün maddeleri PDF sayfası yerine konuya işaret eder
  - Ana ekran — üç bölüme indirgenir, mevcut modlar taşınır (silinmez)
  - Faz makinesi — Almanca üretim aşaması
  - Yeni dinleme ekranı + `ALL_SCREENS` kaydı
  - `srsUpdate` çağrıları — gramer ve dinleme anahtarları
  - `CHANGELOG` — kullanıcıya görünen her değişiklik için girdi (proje kuralı)
- **`icerik/araclar/`** — kapsama testi (her konunun anlatımı var mı, her gün bir konuya bağlı mı, bozuk bağlantı var mı); mevcut `gece-testi.js` bozulmamalı
- **Veri göçü yok** — `localStorage` şeması yalnız genişler; kayıtlı ilerleme silinmez
- **`sw.js`** — önbellek sürümü güncellenmeli, yoksa kullanıcılar eski sürümü görür
