# Ders içeriği yazım yönergesi (icerik/hazir/)

Bu klasör, uygulamaya gömülecek **konu derslerinin** ham halini tutar. Her konu için tek dosya: `konu-<no>.json`.
Doğrulama: `node icerik/araclar/hazir-kontrol.js icerik/hazir/konu-<no>.json` (hata 0 olmadan iş bitmiş sayılmaz).
Gömme işini ben yaparım (`hazir-yerlestir.js`); **`index.html`'e dokunma.**

## Kullanıcı kim, ders nasıl olmalı
Türk bir yetişkin, Almanca A1'den başlıyor, kodlama bilmiyor. Hocasının materyalinden öğreniyor ve **konuyu gerçekten anlamak** istiyor.
Ders; ders kitabı gibi, sayfa sayfa, **önce Türkçe açıklama, sonra Almanca örnek + Türkçe çevirisi**, şemalı ve tablolu olmalı.
Hocanın ezber hileleri / benzetmeleri (ör. "Kral & Soytarı") **aynen korunur**, öne çıkarılır.

## KAYNAK DİSİPLİNİ (en önemli kural)
- Kural, açıklama ve örneklerin **hepsi hocanın PDF sayfalarından** gelir. Kendi Almanca bilgini kaynak yapma.
- Kaynak: `icerik/temiz/{teil1,kalan,a2,teil2}.txt` (sayfa işaretleri `===== SAYFA n =====`, n = PDF'in fiziksel sayfası).
  Metin katmanı eksiktir: sayfaların yaklaşık yarısı **ekran görüntüsüdür**. Metin boş/yetersizse sayfayı görüntüye çevirip **gözünle oku**:
  `node icerik/araclar/sayfa-cek.js "Teil-1.pdf" 50 60 2` → `icerik/sayfa/Teil1-050.png` ... (sonra Read aracıyla PNG'yi aç).
  PDF adları: `Teil-1.pdf`, `Kalan Üniteler.pdf`, `A2 Dosyası.pdf`, `Teil-2.pdf` (repo kökünde). Aralığı tek çağrıda iste (PDF her çağrıda yeniden yüklenir).
- Okuyamadığın / belirsiz kalan sayfadan **kural uydurma**. O maddeyi dersten çıkar, `dogrulama` dizisine tam soru olarak yaz
  (ör. "Hocanın s.62'deki tabloda 'gern' ... doğru mu? Perplexity'ye sor: ...") ve raporuna yaz.
- Hocanın notunda hata olduğunu düşünürsen yine **uydurma düzeltme yapma**: hocanın söylediğini yaz, şüpheyi `dogrulama`ya koy.
- Alıştırma cümleleri (gramer.qs) tek istisnadır: yeni cümle yazabilirsin, ama **yalnızca kaynakta gösterilen kuralı** ölçmeli,
  A1 kelime düzeyinde (hocanın kelime listelerinden) kalmalı, **tam bir doğru cevap** olmalı.

## Dosya biçimi
```json
{
  "konu": 15,
  "baslik": "Hobiler ve gern",
  "kaynak": [{ "arac": "PDF", "sayfa": "Teil-1 s.61-67" }],
  "deste": {
    "title": "🎯 Hobiler ve gern",
    "accent": "linear-gradient(135deg,#2AACD1,#1c7fa0)",
    "slides": [ ...6-16 sayfa... ]
  },
  "gramer": { "id": "d15_gern", "title": "...", "emoji": "❤️", "desc": "tek satır", "rule": "<b>kısa kural özeti</b>...", "qs": [ ...en az 10 soru... ] },
  "dogrulama": []
}
```
`accent` için şunlardan birini kullan: `linear-gradient(135deg,#2AACD1,#1c7fa0)` (mavi), `linear-gradient(135deg,#F0503C,#c23421)` (kırmızı),
`linear-gradient(135deg,#58CC02,#3e9a00)` (yeşil), `linear-gradient(135deg,#D9714E,#A8502F)` (turuncu), `linear-gradient(135deg,#7b3fa0,#4a2468)` (mor).

### Sayfa türleri (deste.slides)
Her sayfada (intro/outro hariç) `"kaynak": "Teil-1 s.62"` zorunlu. Metinlerde yalnız `<b>`, `<br>`, `<i>` kullan.
1. **intro** — `{ "type":"intro", "kicker":"Altın Kural", "big":"GERN", "mean":"Türkçe tek cümle: bu konu ne işe yarar", "story":"kısa giriş / hikâye (HTML)" }`
2. **kavram sayfası** (bir sayfada TEK kavram) — `{ "big":"gern", "mean":"Türkçe anlam/kural", "egs":["Ich schwimme <b>gern</b>. — Yüzmeyi severim."], "tip":"💡 hocanın ipucu", "kaynak":"..." }`
3. **şema** — renk kodlu cümle yapısı, fiilin yerini göstermek için:
   `{ "tur":"sema", "kicker":"Fiil sırası", "baslik":"Ana cümle ↔ yan cümle", "satirlar":[ { "etiket":"Ana cümle", "not":"fiil 2. sırada", "jetonlar":[{"t":"Ich","r":"ozne"},{"t":"lerne","r":"fiil"},{"t":"Deutsch","r":"nesne"}], "tr":"Almanca öğreniyorum." } ], "not":"<b>Kural:</b> ...", "kaynak":"..." }`
   Roller (`r`): `ozne`, `fiil`, `bag` (bağlaç), `nesne`, `zaman` (zaman/yer), `diger`. Satır başına 2–6 jeton (telefon ekranı dar). Çekimli fiil sonda ise o jetona `"sonda":true`.
4. **tablo** — çekim/artikel/liste: `{ "tur":"tablo", "kicker":"Çekim", "baslik":"...", "basliklar":["", "sein", "haben"], "satirlar":[["ich","bin","habe"]], "not":"...", "kaynak":"..." }`
   En çok 4–5 sütun. Her satırın sütun sayısı `basliklar` ile **aynı** olmalı. İlk sütun satır başlığıdır.
5. **zaman çizgisi** — `{ "tur":"zaman", "kicker":"...", "baslik":"...", "noktalar":[{"baslik":"Präteritum","etiket":"yazı dili","ornek":"Ich <b>war</b> müde.","tr":"Yorgundum."}], "not":"...", "kaynak":"..." }`
6. **kural kutusu** — `{ "tur":"kural", "kicker":"Kural", "baslik":"Kısaca", "maddeler":["...","..."], "uyari":"En sık yapılan hata: ...", "kaynak":"..." }`
7. **outro** — `{ "type":"outro", "kicker":"Ezber", "big":"Hepsi DATİV", "mean":"özet", "story":"tek nefeste söylenecek liste/cümle" }`

### Ders akışı (kalite çıtası)
`intro` → her kavram için bir sayfa (açıklama + 2 örnek + hocanın ipucu) → **en az 2 görsel sayfa** (şema/tablo/zaman/kural; konuya uygun olanı seç)
→ "sık hatalar / tuzaklar" (kural sayfası, `uyari` ile) → `outro` (ezber). Toplam **8–14 sayfa** (uzun konularda 16'ya kadar).
Konu kelime ağırlıklıysa (renkler, giyim, meslek, aile, yiyecek…) kelimeleri **tablo** sayfalarıyla grupla, artikelleri (der/die/das) yaz,
hocanın ezber ipuçlarını koru.

### Alıştırmalar (gramer.qs) — doğru cevap tek, açıklama öğretici
`{ "sent":"Ich schwimme ___ im Sommer.", "blank":"gern", "opts":["gern","gerne","gut"], "tr":"Yazın severek yüzerim.", "exp":"gern fiilin yanında 'severim' anlamı katar; ... (kural + neden)." }`
- Cümlede **tam bir** `___`, `blank` mutlaka `opts` içinde, 3–4 benzersiz seçenek.
- Yanlış seçenekler **kuralı bilmeyenin düşeceği** makul tuzaklar olsun (rastgele saçma kelime değil).
- `exp` en az 20 karakter: neden doğru, tipik yanlışın neden yanlış olduğu, kaynak kuralı.
- Doğru cevaplar çeşitli olsun (hep aynı kelime olmasın). En az 10 soru; kolaydan zora, son 2–3 soru karışık/tuzaklı.
- `gramer.rule`: konunun 3–6 satırlık HTML özeti (`<b>`, `<br>`).

## Rapor (işin sonunda, kısa)
Konu listesi · sayfa sayısı · soru sayısı · okunamayan sayfalar · `dogrulama` listesi (Perplexity'ye sorulacaklar).
