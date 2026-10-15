# Almanca PDF Envanteri

Çıkarım tarihi: 15.10.2026 · Kaynak klasör: `C:\Users\Administrator\Desktop\Almanca`

---

## 1. Elimizde ne var?

| Dosya | Fiziksel sayfa | İç sayfa no | Seviye | Kapsam |
|---|---|---|---|---|
| `Teil-1.pdf` | 101 | 1 – 101 | **A1** | Konu 1 – 25 |
| `Kalan Üniteler.pdf` | 127 | 122 – 248 | **A1** | Konu 26 – 38 + Wörter-1/2 |
| `A2 Dosyası.pdf` | 249 | 262 – 509 | **A2** | Konu 1 – 28 |
| `Teil-2.pdf` | 93 | 113 – 205 | **B1** | Konjunktiv II, Plusquamperfekt, Futur I/II |
| ~~`Teil-x.pdf`~~ | ~~212~~ | — | — | **GEREKSİZ — silinebilir** |

**Toplam: 782 sayfa. Teil-x düşülünce 570 sayfa.**

### Teil-x.pdf neden gereksiz?
`A2 Dosyası.pdf` ile sayfa sayfa karşılaştırıldı. Teil-x'in tamamı A2 Dosyası'nın içinde:
İlk 4 sayfa birebir aynı, A2'de 5. sayfada fazladan bir sayfa var, oradan sonra
Teil-x sayfa *n* = A2 sayfa *n+1*. Teil-x konu 20'de bitiyor, A2 konu 28'e kadar gidiyor.
Üstelik A2'nin metni daha temiz çıkıyor. **106 MB ve 212 sayfalık mükerrer iş eleniyor.**

### Teil-1 + Kalan Üniteler = tek bir A1 kitabı
Teil-1'in 3. sayfasındaki içindekiler 38 konu sayıyor ama Teil-1 fiziksel olarak
25. konuda bitiyor. Kalan Üniteler tam da 26. konudan (Modalverben) devam ediyor.
İkisi birlikte A1 kitabının tamamı.

### ⚠ Eksik sayfalar
Teil-1 iç sayfa **101**'de bitiyor, Kalan Üniteler iç sayfa **122**'de başlıyor.
**İç sayfa 102 – 121 arası (yaklaşık 20 sayfa) elimizde yok.** Bu aralık büyük
ihtimalle 25. konunun (Guten Appetit / Obst und Gemüse) bir bölümünü içeriyor.
Bu sayfaların bulunup bulunmadığı kontrol edilmeli.

---

## 2. İçeriğin biçimi — işin zor kısmı

PDF'ler **canlı ders kayıtlarının ekran görüntülerinden** oluşuyor. Sayfalarda fare
imleci ve köşede kamera küçük resmi görünüyor. Yapı karışık:

- Bazı sayfalar **gerçek metin** (kopyalanabilir)
- Bazı sayfalar **tamamen görsel** (JPEG ekran görüntüsü)
- Çoğu sayfa **ikisi karışık** — sol sütun yapıştırılmış görsel, sağ sütun gerçek metin

**Ölçüm sonucu:**

| Dosya | Toplam sayfa | Metinsiz (<60 karakter) | Metinli |
|---|---|---|---|
| Teil-1 | 101 | 41 | 60 |
| Kalan Üniteler | 127 | 47 | 80 |
| A2 Dosyası | 249 | 114 | 135 |
| Teil-2 | 93 | 47 | 46 |
| **Toplam** | **570** | **249** | **321** |

Metinli sayfalar da ortalama yalnızca ~500 karakter veriyor; görünen içeriğin bir
kısmı yine görselde kalıyor. **Yani içeriğin tamamına ulaşmak için görüntüden okuma
(OCR / görsel okuma) şart.** Bu, 2. adımın işi.

---

## 3. Bitişik harf (ligature) bozulması — teşhis ve çözüm

Çıkarılan metinde sistematik bir bozulma vardı:

```
der Sa* → die Sä*e        aslında: der Saft → die Säfte
sa7n almak is9yorum       aslında: satın almak istiyorum
Süpermarke>e              aslında: Süpermarkette
Die ArTkel / NominaTv     aslında: Die Artikel / Nominativ
Das We]er                 aslında: Das Wetter
Geschä= · läu=            aslında: Geschäft · läuft
```

**Sebep:** PDF'e gömülü fontların karakter eşleme tablosu (ToUnicode) hatalı.
`ft`, `tt`, `ti`, `tı`, `fı` gibi bitişik harf çiftleri tek bir simgeye çökmüş.
Kütüphane sorunu değil — `pdf-parse` ve poppler'ın `pdftotext`'i aynı hatayı veriyor.

**Neden basit bir harf tablosu yetmiyor:** Aynı dosyada `T` bazen `ti` bazen `tt`
oluyor (`isTyorum` → istiyorum, ama `MuTer` → Mutter), çünkü her sayfa farklı font
alt kümesi kullanıyor.

**Çözüm (`onar.js`):** Sözlük tabanlı onarım.
1. Metnin bozulmamış kısımlarından 6.324 kelimelik bir sözlük kuruluyor
2. Bozuk kelimenin her harf konumu için 19 olası açılım deneniyor
3. Sözlükte en sık geçen aday seçiliyor
4. Başarılı onarımlardan simge tablosu öğreniliyor (`7`→tı, `9`→ti, `>`→tt, `*`→ft)
5. Sözlüğün bulamadığı kelimelere bu öğrenilmiş tablo uygulanıyor

**Sonuç:** 146 kelime türü sözlükle, kalanlar tabloyla onarıldı.
Kelime sonundaki `?` ve `:` noktalama olarak korunuyor — yoksa Türkçe soru eki
`mi?` yanlışlıkla `mich` oluyordu.

**Çıktı:**
- `icerik/ham/` — ham çıkarım (sayfa numaralı)
- `icerik/temiz/` — onarılmış metin ← **bunu kullan**

**Kalan sorun:** Sözlükte hiç geçmeyen nadir kelimeler onarılamadı
(`GutenMorgen`, `dieNacht` gibi birleşik yazılmış kelimeler ayrı bir sorun).

---

## 4. A1 konu listesi (Teil-1 + Kalan Üniteler)

Sayfa numaraları fiziksel sayfadır. ✓ = metinde doğrulandı, ≈ = aradeğerleme ile tahmin.

| # | Konu | Dosya | Sayfa |
|---|---|---|---|
| 1 | Das Alphabet | Teil-1 | 4 – 6 ✓ |
| 2 | Hallo! Hi! | Teil-1 | 7 – 10 ≈ |
| 3 | Wie geht es Ihnen? | Teil-1 | 11 ✓ |
| 4 | Wie heißen Sie? | Teil-1 | 12 – 16 ≈ |
| 5 | Tschüs! Bye! | Teil-1 | 17 – 18 ≈ |
| 6 | Die Zahlen | Teil-1 | 19 – 22 ≈ |
| 7 | Die E-Mail-Adresse | Teil-1 | 23 – 25 ✓ |
| 8 | Wo wohnen Sie? | Teil-1 | 26 ✓ |
| 9 | Woher kommen Sie? | Teil-1 | 27 – 28 ✓ |
| 10 | Die Länder / Die Sprachen | Teil-1 | 29 – 31 ≈ |
| 11 | Ihre Information | Teil-1 | 32 – 33 ✓ |
| 12 | Die Farben | Teil-1 | 34 ✓ |
| 13 | Die Kleidung | Teil-1 | 35 – 49 ✓ |
| 14 | Die Verben + TMP | Teil-1 | 50 – 60 ✓ |
| 15 | Die Hobbys / Gern | Teil-1 | 61 – 67 ✓ |
| 16 | Das Wetter | Teil-1 | 68 – 70 ✓ |
| 17 | Gehen wir ins Kino? | Teil-1 | 71 – 72 ≈ |
| 18 | Die Berufe | Teil-1 | 73 – 82 ✓ |
| 19 | Die Artikel / Nominativ | Teil-1 | 83 – 86 ✓ |
| 20 | Die Artikel / Akkusativ | Teil-1 | 87 – 89 ≈ |
| 21 | Präpositionen mit immer Akkusativ | Teil-1 | 90 ✓ |
| 22 | Die Plural-Formen | Teil-1 | 91 – 95 ✓ |
| 23 | Nicht oder Kein | Teil-1 | 96 – 98 ≈ |
| 24 | W-Fragen | Teil-1 | 99 – 101 ✓ |
| 25 | Guten Appetit (Obst und Gemüse) | Kalan | 9 – 18 ✓ |
| 26 | Modalverben (Präsens) | Kalan | 3 – 8 ✓ |
| 27 | Die trennbaren Verben | Kalan | 19 – 46 ✓ |
| 28 | Wie spät ist es? (Uhrzeit) | Kalan | 47 – 55 ✓ |
| 29 | Präteritum – sein und haben | Kalan | 56 – 63 ≈ |
| 30 | Die Artikel / Dativ | Kalan | 64 – 78 ✓ |
| 31 | Präpositionen mit immer Dativ | Kalan | 79 – 84 ✓ |
| 32 | Die Artikel / Genitiv | Kalan | 85 – 90 ✓ |
| 33 | Meine Familie | Kalan | 91 – 94 ✓ |
| 34 | Demonstrativpronomen | Kalan | 95 ✓ |
| 35 | Imperative | Kalan | — ⚠ bulunamadı |
| 36 | Das Perfekt | Kalan | 96 – 112 ✓ |
| 37 | Zuerst / Dann / Danach | Kalan | 113 – 117 ✓ |
| 38 | Einen Brief schreiben | Kalan | 118 – 122 ✓ |
| + | Wörter-1 (kelime listesi) | Kalan | 123 – 125 ✓ |
| + | Wörter-2 (kelime listesi) | Kalan | 126 – 127 ✓ |

**Not:** 25 ve 26 numaralı konular PDF'te içindekiler sırasının tersine duruyor —
Kalan Üniteler Modalverben ile başlıyor, Obst und Gemüse metni sonra geliyor.

**Not:** 35) Imperative metinde hiç geçmiyor. Ya tamamen görsel bir sayfada,
ya da eksik 102–121 aralığında. Görsel geçişte kontrol edilecek.

---

## 5. A2 konu listesi (A2 Dosyası.pdf)

| # | Konu | Sayfa |
|---|---|---|
| 1 | Präpositionen (genel tekrar) | 10 – 30 ✓ |
| 2 | Legen / Stellen / Liegen / Stehen / Hängen | 45 – 50 ✓ |
| 3 | Wie komme ich ...? | 51 – 66 ≈ |
| 4 | Wörter-1 | 67 – 85 ✓ |
| 5 | Die Körperteile | 86 – 95 ✓ |
| 6 | Und / oder / aber / denn | 96 – 105 ≈ |
| 7 | Possessivartikel | 106 – 120 ≈ |
| 8 | Reflexive Verben | 121 – 134 ✓ |
| 9 | Doch / Noch | — ⚠ bulunamadı |
| 10 | Weil / da | 135 – 140 ✓ |
| 11 | Deshalb / Sonst | 141 – 145 ≈ |
| 12 | Bis | — ⚠ bulunamadı |
| 13 | Die Küche | 146 – 151 ✓ |
| 14 | Schultypen / Die Fächer | 152 – 168 ✓ |
| 15 | Medien im Alltag | — ⚠ bulunamadı |
| 16 | Wörter-2 | 169 – 190 ✓ |
| 17 | Komparativ und Superlativ | 191 – 205 ✓ |
| 18 | Adjektivdeklination | 206 – 212 ≈ |
| 19 | ...selbe / ...gleiche | 213 – 215 ✓ |
| 20 | Wenn / es sei denn / falls / als | 216 – 222 ✓ |
| 21 | Damit / um ... zu | 223 – 234 ✓ |
| 22 | Die n-Deklination | 228 ✓ |
| 23 | Indirekte Fragen | 235 ✓ |
| 24 | Je nachdem ... ob | 236 – 237 ✓ |
| 25 | Modalverben (Präteritum) | 238 – 241 ✓ |
| 26 | Werden | 242 – 245 ✓ |
| 27 | Höflichkeitsform | 246 – 247 ✓ |
| 28 | Zusammengesetzte Wörter | 248 – 249 ✓ |

Bulunamayan 4 konu (9, 12, 15 ve kısmen 18) büyük olasılıkla tamamen görsel
sayfalarda. Görsel geçişte netleşecek.

---

## 6. Teil-2.pdf — kapsam dışı

İçerik: Genitiv edatları, zweiteilige Konjunktionen, lassen, Indefinitpronomen,
Adverbien, **Konjunktiv II**, Plusquamperfekt, Futur I, Futur II.

Bu **B1 seviyesi**. 30 günlük A1 tekrar planına girmiyor. A1 ve A2 bittikten sonra
ayrı bir plan konusu.

---

## 7. Uygulamada hâlihazırda ne var?

`index.html` içinde 18 gramer konusu, kelime kategorileri, edat/artikel/çoğul
egzersizleri, 3 A2 slaytı (weil/denn/dann, Futur I, ayrılabilen fiiller) bulunuyor.

A1'in 38 konusuyla karşılaştırma, konular uygulamaya eklenirken yapılacak —
hangisi zaten var, hangisi yeni, 2. adımın başında çıkarılacak.

---

## 8. Sırada ne var?

1. **Görsel geçiş** — 249 metinsiz sayfanın görüntüden okunması. Poppler kuruldu
   (`pdftoppm`), sayfalar PNG'ye çevrilebiliyor. Bu adım envanterdeki ≈ ve ⚠
   işaretlerini kesinleştirir.
2. **Eksik 102–121 aralığının** araştırılması.
3. Konuların uygulamaya aktarılması (anlatım + alıştırma + Hören/Lesen/Schreiben).

---

## Dosya düzeni

```
icerik/
  ham/          pdf-parse ham çıkarımı, sayfa numaralı
    teil1.txt  teil2.txt  kalan.txt  a2.txt
  temiz/        bitişik harf onarımı yapılmış ← kullanılacak sürüm
    teil1.txt  teil2.txt  kalan.txt  a2.txt
  envanter.md   bu dosya
  plan30.json   15 Ekim – 13 Kasım çalışma takvimi
```
