## 1. Doğrulama altyapısı (önce bu — sonraki her işin ölçüsü)

- [x] 1.1 `icerik/araclar/kapsama-testi.js` yaz: her konunun anlatımı var mı, her gün bir konuya bağlı mı, her bağlantıdaki fonksiyon tanımlı mı, `b:` ve `wrongExp` eksikleri ne — hepsini sayıyla raporlasın.
- [x] 1.2 Aracı mevcut hal üzerinde çalıştır, başlangıç durumunu kaydet (beklenen: 12 konu anlatımsız, 4 gün egzersizsiz, 358 kelimede `b:` yok, 106 soruda `wrongExp` yok).

## 2. Konu omurgası (kod — içerik yok)

- [ ] 2.1 `KONULAR` dizisini kur: 38 konu, her biri `{no, ad, kaynak:{pdf,sayfa}, anlatim, kategori, gramer, slayt, alistirma[]}` (design Karar 1). Sayfa bilgisi `PLAN30`'daki mevcut eşlemeden alınır.
- [ ] 2.2 Mevcut 26 konunun karşılıklarını bağla: gramer id'leri, kelime kategorileri, slaytlar, YS Hub anlatımları — hiçbirini kopyalama, yalnız işaret et.
- [ ] 2.3 Konu ekranını yaz: dört adım (anlatım → kelimeler → alıştırma → test), hangi adımda olunduğu görünür, adımlar arası geçiş bu ekrandan yapılır.
- [ ] 2.4 Konu durumunu `srsUpdate('konu:'+no, ...)` ile mevcut SRS motoruna bağla (design Karar 6).
- [ ] 2.5 Konu listesi ekranını yaz: 38 konu, her birinin durumu (başlanmadı / devam / tamamlandı / tekrarı geldi).
- [ ] 2.6 Anlatımı henüz yazılmamış konuyu listede "hazırlanıyor" olarak işaretle — boş ekran gösterme.
- [ ] 2.7 `node icerik/araclar/gece-testi.js` çalıştır — sıfır hata.

## 3. Konu anlatımları — hocanın slaytlarından (içerik)

- [ ] 3.1 Konu 1-5 sayfalarını `sayfa-cek.js` ile çek, oku, anlatımı yaz (Das Alphabet, Hallo! Hi!, Wie geht es Ihnen?, Wie heißen Sie?, Tschüs! Bye!). Alfabe için IPA telaffuz tablosu ve okuma kuralları (`ei/ie/au/eu`, `ch/sch/st/sp`, `ss/ß`, `tz`, `ck`, `ph`) dahil.
- [ ] 3.2 Konu 6-11 anlatımları (Die Zahlen, Die E-Mail-Adresse, Wo wohnen Sie?, Woher kommen Sie?, Die Länder-Die Sprachen, Ihre Information).
- [ ] 3.3 Konu 12-18 anlatımları (Die Farben, Die Kleidung, Die Verben + TMP, Die Hobbys/Gern, Das Wetter, Gehen wir ins Kino?, Die Berufe).
- [ ] 3.4 Konu 19-25 anlatımları (Artikel/Nominativ, Artikel/Akkusativ, Präp. immer Akkusativ, Plural-Formen, Nicht oder Kein, W-Fragen, Guten Appetit).
- [ ] 3.5 Konu 26-32 anlatımları (Modalverben, Trennbare-Verben, Wie spät ist es?, Präteritum Sein/Haben, Artikel/Dativ, Präp. immer Dativ, Artikel/Genitiv).
- [ ] 3.6 Konu 33-38 anlatımları (Meine Familie, Demonstrativpronomen, Imperative, Das Perfekt, Zuerst/Dann/Danach, Einen Brief schreiben).
- [ ] 3.7 Mevcut 21 gramer kural kartını ilgili konuya bağla; çakışma varsa hocanın materyalindeki kuralı esas al.
- [ ] 3.8 Okunamayan sayfa çıkarsa daha yüksek ölçekle yeniden çek; yine okunamıyorsa kuralı uydurma, atla ve not düş (design Risks).
- [ ] 3.9 Kapsama testi: anlatımı olmayan konu sayısı 0 olmalı.

## 4. Animasyonlu anlatımlar (içerik — mevcut slayt deseni)

- [ ] 4.1 Mantık/ayrım ağırlıklı konuları belirle ve mevcut 5 slaytı bunlara bağla (design Karar 3).
- [ ] 4.2 Artikel sisteminin (Nominativ → Akkusativ → Dativ → Genitiv) tek bütün olarak gösterildiği animasyonlu anlatım yaz.
- [ ] 4.3 Alfabe/telaffuz için harf ve ses eşlemesini gösteren animasyonlu anlatım yaz.
- [ ] 4.4 Demonstrativpronomen için animasyonlu anlatım yaz.
- [ ] 4.5 `node icerik/araclar/gece-testi.js` — sıfır hata; iki temada ekran görüntüsü al.

## 5. Günlük akış (kod)

- [ ] 5.1 `PLAN30` gün maddelerini konuya bağla: PDF sayfası yerine `KONULAR` numarasına işaret etsin.
- [ ] 5.2 Günü tek akış olarak yürüten mekanizmayı yaz: tek başlatma, adım bitince sıradaki kendiliğinden gelir, kullanıcı adım seçmez.
- [ ] 5.3 Akışın neresinde olunduğunu göster (kaç adımdan kaçıncısı).
- [ ] 5.4 Gün tamamlanma bildirimini yalnız tüm adımlar bitince göster; elle "tamamladım" seçeneği sunma.
- [ ] 5.5 Ana ekranda dün / bugün / yarın bilgisini göster: dün ne çalışıldı ve tamamlandı mı, bugün ne var, sırada ne geliyor.
- [ ] 5.6 Yarım kalan günü eksik olarak işaretle ve geri dönüp tamamlamayı mümkün kıl.
- [ ] 5.7 Gün 1, 2, 5 ve 18 dahil her günün çalıştırılabilir içeriği olduğunu doğrula.
- [ ] 5.8 Kapsama testi: egzersizsiz gün 0, bozuk bağlantı 0, programa girmemiş konu 0.

## 6. Ana ekran düzeni (kod — mevcut modlar silinmez)

- [ ] 6.1 Ana ekranı üç bölüme indir: Bugün · Konular · Ek Çalışma (design Karar 5).
- [ ] 6.2 Mevcut 17 modu "Ek Çalışma" altına taşı ve türlerine göre grupla (kelime · gramer · oyun · yazma); hiçbirini silme.
- [ ] 6.3 Ek Çalışma bölümünü varsayılan olarak katlanmış getir.
- [ ] 6.4 Her alt ekranda hangi konuya/güne ait olunduğunu göster ve geri dönüşü sağla.
- [ ] 6.5 Önceden erişilebilen her modun hâlâ erişilebilir olduğunu test et; `node icerik/araclar/gece-testi.js` sıfır hata.

## 7. Dinleme modu (kod)

- [ ] 7.1 Almanca ses denetimi: `speechSynthesis` veya `de-DE` sesi yoksa mod açılmasın, sebebi Türkçe gösterilsin.
- [ ] 7.2 Dinleme ekranını ve `ALL_SCREENS` kaydını ekle; metin cevap verilene kadar gizli kalsın.
- [ ] 7.3 Dinle / yavaş dinle düğmeleri; sınırsız tekrar, puanı etkilemesin.
- [ ] 7.4 Diktat soru tipi: ses çalar, kullanıcı duyduğunu Almanca yazar.
- [ ] 7.5 Anlama soru tipi: ses çalar, kullanıcı Türkçe anlamı şıklardan seçer.
- [ ] 7.6 Cevaptan sonra tam metni ve çevirisini aç.
- [ ] 7.7 Soru havuzunu mevcut cümlelerden kur (`YAZMA_TEXTS`, `s:`, `b:`, paragraflar).
- [ ] 7.8 Sonuçları `srsUpdate` ile kaydet; yanlış bilinen tekrar öncelikli gelsin.
- [ ] 7.9 Dinlemeyi beceri etiketi `horen` olan günlere ve ilgili konulara bağla.
- [ ] 7.10 İki temada Playwright doğrulaması; `gece-testi.js` sıfır hata.

## 8. Almanca üretim aşaması (kod)

- [ ] 8.1 Faz zincirine `typeDE` ekle: `mc → type(TR) → mcrev → typeDE → [cümle] → done`.
- [ ] 8.2 `type(TR)` eşiğini 2'den 1'e indir (design Karar 8).
- [ ] 8.3 `typeDE` ekranı: Türkçe anlam gösterilir, şık verilmez, Almancası yazılır.
- [ ] 8.4 Kademeli tolerans: umlaut / `ß`↔`ss` / büyük-küçük harf kabul edilir ve doğrusu vurgulanır; isimde yanlış veya eksik artikel reddedilir.
- [ ] 8.5 Yanlışta doğru yazımı göster, öğrenilmiş sayma, aynı oturumda tekrar sor.
- [ ] 8.6 `LEARN_BATCH_SIZE` değerini yeni aşama sayısına göre gözden geçir.
- [ ] 8.7 Bir kelimenin tüm aşamalardan geçişini Playwright ile uçtan uca dene; `gece-testi.js` sıfır hata.

## 9. Kelime bağlam cümleleri (içerik)

- [ ] 9.1 `b:{de,tr}` biçimini sabitle; mevcut `s:` alanına dokunma.
- [ ] 9.2 `s:` olan 34 kelimenin `b:` değerini mevcut `chunks`'tan türet — yeni cümle yazma.
- [ ] 9.3 Fiiller (58) için `b:` cümleleri yaz.
- [ ] 9.4 İsimler (46) için `b:` cümleleri yaz.
- [ ] 9.5 Zarflar (28) + Edatlar (12) için `b:` cümleleri yaz.
- [ ] 9.6 Sayılar (20) + Renkler (14) + Saat (15) için `b:` cümleleri yaz.
- [ ] 9.7 Kıyafet (16) + Aile (17) + Yiyecek (19) için `b:` cümleleri yaz.
- [ ] 9.8 Hava (16) + Meslekler (16) + Soru Kelimeleri (18) için `b:` cümleleri yaz.
- [ ] 9.9 Çiftlik ve Medeni Durum'da `s:` olmayan kelimeler için `b:` cümleleri yaz.
- [ ] 9.10 Kapsama testi: `b:` olmayan kelime sayısı 0.

## 10. Bağlamı ekranda gösterme (kod)

- [ ] 10.1 Tanıtım kartında `b:` cümlesini ve çevirisini göster, kelimeyi cümle içinde vurgula.
- [ ] 10.2 Yanlış cevap geri bildiriminde `b:` cümlesini göster.
- [ ] 10.3 `b:` yoksa eski davranışa düş, boş kutu gösterme.
- [ ] 10.4 `gece-testi.js` sıfır hata.

## 11. Gramer geri bildirimi ve tekrarı

- [ ] 11.1 `wrongExp:{"şık":"açıklama"}` biçimini `EDAT_QS` desenine göre sabitle.
- [ ] 11.2 Konu 1-5 gramer soruları için `wrongExp` yaz (sein, nominativ, akkusativ, dativ, akk_praep).
- [ ] 11.3 Konu 6-10 için `wrongExp` yaz (dat_praep, wechsel_praep, modal, trennbar, imperativ).
- [ ] 11.4 Konu 11-15 için `wrongExp` yaz (perfekt, praeteritum, weil, futur, negation).
- [ ] 11.5 Konu 16-21 için `wrongExp` yaz (possessiv, gern, wetter, zaman_edat, ins_im, meslekler).
- [ ] 11.6 Yanlış şık seçilince o şıkka ait açıklamayı göster; yoksa mevcut `exp:` davranışına düş.
- [ ] 11.7 Yanlışta seçilen şıkkın açıklaması ile doğru cevabın kuralını ayrı kutularda göster; doğruda kuralı kısaca hatırlat.
- [ ] 11.8 Gramer konu testi bitince `srsUpdate('gr:'+id, ...)` çağır; tekrarı gelen konuları ana ekranda ve konu listesinde göster.
- [ ] 11.9 Kapsama testi: `wrongExp` olmayan soru sayısı 0; iki temada okunabilirlik doğrulaması.

## 12. Kapanış

- [ ] 12.1 `CHANGELOG` dizisine kullanıcıya görünen her değişiklik için girdi ekle (konu anlatımları, konu akışı, yeni ana ekran düzeni, günlük akış, dinleme modu, Almanca yazma aşaması, bağlam cümleleri, gramer hata açıklamaları, gramer tekrarı).
- [ ] 12.2 `sw.js` içindeki `CACHE` sürümünü güncelle.
- [ ] 12.3 `index.html` boyutunu ölç; 700 KB aşıldıysa veri ayırma ihtiyacını not et.
- [ ] 12.4 Tüm test araçlarını son kez çalıştır: `gece-testi.js`, `kapsama-testi.js`, `supabase-testi.js` — hepsi sıfır hata.
- [ ] 12.5 Ana ekran, konu ekranı, günlük akış, dinleme modu ve gramer geri bildirimini iki temada ekran görüntüsüyle gözle kontrol et.
- [ ] 12.6 Commit ve push yap — yoksa canlı sitede görünmez.
