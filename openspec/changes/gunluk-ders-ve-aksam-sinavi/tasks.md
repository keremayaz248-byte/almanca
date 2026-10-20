## 1. Hazırlık ve doğrulama altyapısı (önce bu)

- [x] 1.1 `.gitignore`'a `_pplx_profile/`, `_pplx.js`, `_pplx_giris.js`, `_pplx.png` ve araç yan ürünlerini ekle; `git status` ile bu dosyaların izlenmediğini doğrula.
- [x] 1.2 `index.html` boyutunu (564 KB) ve satır sayısını (8.314) başlangıç değeri olarak not et.
- [x] 1.3 Mevcut test araçlarını çalıştır ve sıfır hata temelini kaydet: `icerik/araclar/gece-testi.js`, `kapsama-testi.js`, `derin-kontrol.js`, `horen-testi.js`.
- [x] 1.4 Yeni Playwright iskeleti yaz (`icerik/araclar/gun-akisi-testi.js`): sunucuyu açar, giriş katmanını atlar, konsol hatası ve ekran görüntüsü toplar.
- [x] 1.5 `viewport` meta'sına `viewport-fit=cover` ekle; hiçbir ekranın bozulmadığını `gece-testi.js` ile doğrula.
- [x] 1.6 Telif envanteri: `SINAV_HOREN` ve Lesen/Schreiben havuzlarında Goethe Modellsatz'dan birebir alınan maddeleri (`index.html:3494` "Teil 1 — Modellsatz'tan birebir" ve `index.html:3486`, `3617` kaynak notları) listele; kaç madde olduğunu yaz.

## 2. İçerik hattı kurulumu

- [x] 2.1 `notebooklm-py[browser]` kurulumu; sürüm ve yardım çıktısını doğrula.
- [ ] 2.2 `notebooklm login` çalıştır: kullanıcının bilgisayarında bir tarayıcı penceresi açılır, kullanıcı Google hesabıyla kendisi giriş yapar (link gerekmez, şifre ben görmem); `auth check` ile oturumu doğrula; oturum dosyasının depo dışında olduğunu doğrula.
- [ ] 2.3 NotebookLM'de "Almanca" defteri oluştur; kaynak olarak `icerik/temiz/teil1.txt`, `kalan.txt`, `teil2.txt` ve gerekirse ilgili PDF'ler yüklenir (127 MB'lık A2 dosyası bu aşamada yüklenmez).
- [ ] 2.4 Örnek sayfa testi: Teil-1'den görsel ağırlıklı bir sayfa (ör. s. 50), Kalan Üniteler'den bir sayfa ve Teil-2'den bir sayfa (ör. s. 113) için NotebookLM'e "bu sayfada ne yazıyor" sor; cevabı `icerik/temiz` metniyle ve sayfa görüntüsüyle karşılaştır; sonucu `icerik/envanter.md`'ye not et.
- [ ] 2.5 Kaynak kararını yaz: NotebookLM okuması yeterliyse PDF doğrudan, değilse `temiz` metin + görsel okuma.
- [ ] 2.6 Medya örnek testi: tek bir konu için podcast (Türkçe), flashcard, quiz ve zihin haritası üret ve indir; podcast'in dilini, Almanca telaffuzunu ve dosya boyutunu not et; sonuca göre depolama kararını yaz (depo / Supabase Storage / podcast'siz).
- [ ] 2.7 `_pplx.js`'i `icerik/araclar/perplexity-sor.js` olarak, soru parametreli ve cevabı dosyaya yazan hâle getir; kullanıcı Perplexity'de giriş yaptıysa oturumun kalıcı olduğunu doğrula.
- [x] 2.8 Kaynak etiketli ara biçimi tanımla: `icerik/hazir/<konu>.json` içinde her madde `{tur, tr, de, kaynak:{arac, sayfa}}`; biçimi doğrulayan küçük bir kontrol betiği yaz.

## 3. Alt menü ve açılış (kod)

- [x] 3.1 Ekran kimliği → sekme haritasını tanımla; her ekran tam olarak bir sekmeye (veya hiçbirine) ait olsun.
- [x] 3.2 Alt menü çubuğunu ekle (Bugün / Öğren / Sınav / Pratik); `env(safe-area-inset-bottom)` boşluğu, 44x44 dokunma hedefi, açık ve koyu tema.
- [x] 3.3 Çubuğu soru/sınav/oyun ekranlarında gizle; sekme ana ekranlarında göster; içerik altına çubuk yüksekliği kadar boşluk bırak.
- [x] 3.4 Uygulamayı Bugün sekmesine aç; mevcut ana ekran bölümlerini sekmelere dağıt: Bugün (günlük plan + "Devam et"), Öğren (Konular listesi, anlatımlar, slaytlar), Sınav (Hören/Lesen/Schreiben), Pratik (Ek Çalışma gövdesi, Düello).
- [x] 3.5 Dinleme ve Yazma girişlerinin her birini tek sekmeye indir; eski girişlerin hepsinin hâlâ erişilebilir olduğunu bir listeyle doğrula.
- [x] 3.6 Alt ekranlarda hangi konu/güne ait olunduğunu gösteren üst etiketi ve geri dönüşü sekmeye bağla (`hdrBackGo`).
- [x] 3.7 Playwright testi (`gun-akisi-testi.js`): 390 piksel genişlikte dört sekmeyi gez, her sekmede konsol hatası ve yatay taşma sıfır; iki temada ekran görüntüsü; `gece-testi.js` sıfır hata.
- [ ] 3.8 iPhone ana ekran kipinde alt menünün çentikle çakışmadığını kullanıcının arkadaşı (iPhone) elle doğrular; sonucu not et.

## 4. Gün programı (kod)

- [x] 4.1 Yeni program veri yapısını `PLAN30` biçiminde tanımla; ilerleme `DB.okul` altında (başlangıç tarihi, tamamlanma haritası, hedef); eski `DB.plan` kayıtlarına dokunma; `loadDB` eski kayıtlarla uyumlu.
- [x] 4.2 Program dizisini kur: konu 1–25, 26–38, Teil-2 konuları; hafif konular aynı güne, yoğun konular birden çok güne; araya tekrar günleri (içerik/sıralama kararı ayrı: bkz. 4.3).
- [x] 4.3 Program içeriğini yaz (içerik): hangi gün hangi konu, hangi tekrar günü; toplam 44 konunun ≈45 güne sığdığını göster.
- [x] 4.4 Gün ekranı: günün adımları (anlatım → egzersiz → akşam sınavı) sırayla, her birinin durumuyla.
- [x] 4.5 "Devam et" düğmesi: yarım kalan adımı kaldığı yerden, yoksa sıradaki adımı açar; adım bitince sıradaki kendiliğinden önerilir.
- [x] 4.6 Atlanan günü eksik olarak işaretle ve geri dönüp tamamlamayı sağla.
- [x] 4.7 Zayıf konu için günün başına kısa tekrar adımı ekle (görev 5.5'e bağlanır).
- [x] 4.8 Playwright testi: sıfırdan bir gün baştan sona; uygulamayı kapat-aç, durumun korunduğunu doğrula; `gece-testi.js` sıfır hata.

## 5. Sınav akışı (kod)

- [x] 5.1 `SINAV_HOREN` sorularını `teil`'e göre grupla ve Teil 1 → 2 → 3 sırasıyla ver; her Teil kendi içinde karışır; Teil geçişinde başlık ve nasıl cevaplanacağı gösterilir.
- [x] 5.2 Lesen için aynı sıralı akışı uygula.
- [x] 5.3 Sonuç geçmişi: `DB.sinavGecmis` listesine `{tarih, bolum, dogru, toplam, zayif}` yaz; Sınav sekmesinde geçmişi göster.
- [x] 5.4 Deneme sınavı: Hören → Lesen → Schreiben zinciri ve tek özet ekranı.
- [x] 5.5 `SINAV_HOREN.konu` etiketlerini `KONULAR.no`'ya eşleyen tabloyu yaz; yanlış soruda `srsUpdate('konu:'+no,false)` çağır ve konuyu zayıf olarak işaretle.
- [x] 5.6 Almanca ses yoksa Türkçe uyarı ve metin modu (mevcut davranışı spec'e uydur).
- [x] 5.7 Playwright testi (`horen-testi.js` genişletilmiş): Teil sırası, sonuç kaydı, uygulama yeniden açılınca geçmişin durması; eşlenmemiş etiket sayısı 0; `gece-testi.js` sıfır hata.

## 6. Akşam sınavı, takvim ve e-posta (kod)

- [x] 6.1 Akşam sınavı seçici: günün konusu + vadesi gelmiş SRS maddeleri + `DB.mistakes`; zayıf maddeler daha sık.
- [x] 6.2 Sınavı mevcut gramer/MC sınav ekranıyla çalıştır; sonucu `DB.okul.aksam[tarih]` altında `{yapildi, ertelendi}` olarak yaz.
- [x] 6.3 20:00 kapısı: açılışta yerel saat ≥ 20:00 ve sınav yapılmamışsa sınavı öner; "Ertele" bir kez; ikinci açılışta kalkmaz; yapılmışsa doğrudan açılır.
- [x] 6.4 "Takvime ekle" bölümü: düğme Google Calendar şablon adresini (günlük tekrar, İstanbul saati, ilk gün 20:00–20:30) açar; her telefon kendi olayını kurar; bildirimin kişiye özel olduğunu söyleyen not.
- [x] 6.5 Playwright testi: saat taklidiyle 19:59 / 20:01, ertele-bir-kez, sınav sonrası serbest giriş; takvim adresinin parametrelerini (`recur`, `ctz`, `dates`) doğrula; `gece-testi.js` sıfır hata.
- [ ] 6.6 İsteğe bağlı e-posta kurulumu: `profiles` tablosuna e-posta paylaşım onayı ve e-posta sütunu ekle; karşı tarafın okuyabileceği kural yaz (şu an yalnız kendi satırı okunuyor, `icerik/supabase/schema.sql:86`); `supabase-testi.js` ile doğrula; kullanıcıdan Supabase panelinde SQL'i çalıştırmasını iste.
- [ ] 6.7 Kurulum ekranı: iki taraf da onayladıysa e-postaları yazılı Google Apps Script betiğini ve kopyalama düğmesini göster (olay + davet + 10 dk önce açılır/e-posta hatırlatma + günlük e-posta tetikleyicisi); onay yoksa karşı e-posta görünmez.
- [ ] 6.8 Betiği kullanıcının hesabında bir kez çalıştırıp (yetkilendirme kullanıcıda) olayın iki takvimde göründüğünü ve e-postanın geldiğini elle doğrula; ücretsiz e-posta kotasını Google belgesinden doğrula.
- [ ] 6.9 Playwright testi: onay yokken karşı e-posta hiçbir yerde görünmez; onaydan sonra betik metninde iki e-posta vardır.

## 7. Hedef sınav (kod)

- [ ] 7.1 Ayar ekranı: sınav türü (Goethe A1/A2/B1, telc, ÖSD, belirsiz) ve tarih; `DB.okul.hedef` altında saklanır.
- [ ] 7.2 İlk akşam sınavının sonunda hedef sorusu ("Sonra" seçeneğiyle).
- [ ] 7.3 Bugün'de geri sayım; hedef belirsizse gösterilmez.
- [ ] 7.4 Uyuşmazlık notları: program hedeften sonra bitiyorsa; hedef A1 iken B1 konusu açılıyorsa.
- [ ] 7.5 Playwright testi: hedef girişi, kalıcılık, geri sayım, iki uyuşmazlık notu; `gece-testi.js` sıfır hata.

## 8. Görsel ders sayfası motoru ve medya oynatıcı (kod)

- [ ] 8.1 Slayt oluşturucuya yeni türler ekle: `sema` (renk kodlu cümle yapısı), `tablo`, `zaman`; mevcut türlere dokunma.
- [ ] 8.2 Cümle öğesi renk paleti ve sıra numaraları (özne, fiil, bağlaç, diğer) — açık/koyu temada kontrast WCAG AA.
- [ ] 8.3 Satır içi SVG/HTML bileşenleri: fiil-sırası oku, ana cümle / yan cümle karşılaştırma şeması, çekim tablosu, zaman çizgisi; Almanca yazı gerçek metin.
- [ ] 8.4 Anlatımın son sayfasına konunun egzersizini başlatan düğme.
- [ ] 8.5 Podcast oynatıcı: oynat/duraklat, ±10 sn, hız; podcast yoksa gösterme; çevrimdışıyken Türkçe mesaj.
- [ ] 8.6 Playwright testi: örnek deste her yeni türle; oynatıcı podcast'li ve podcast'siz konuda; 390 piksel genişlikte taşma ve kontrast; `icerik/araclar/erisim-denetimi.js` ve `gece-testi.js` sıfır hata.

## 9. Teil-1 konu 12–25 anlatımları (içerik)

- [ ] 9.1 Konu 12–14 (Renkler, Kıyafetler, Fiiller ve TMP sırası): NotebookLM ile çıkar, kaynak etiketli ara JSON, siteye göm.
- [ ] 9.2 Konu 15–17 (Hobiler/gern, Hava, Sinema daveti).
- [ ] 9.3 Konu 18–19 (Meslekler, Nominativ).
- [ ] 9.4 Konu 20–21 (Akkusativ, Akkusativ edatları).
- [ ] 9.5 Konu 22–23 (Çoğul biçimleri, nicht/kein).
- [ ] 9.6 Konu 24–25 (W-Fragen, Guten Appetit).
- [ ] 9.7 Her konunun egzersizini mevcut havuzlardan bağla; eksik olan konular için yeni soru yaz (kaynak etiketli).
- [ ] 9.8 Kapsama testi: anlatımı olmayan konu 12–25 sayısı 0; `derin-kontrol.js` sıfır hata.

## 10. Kalan Üniteler konu 26–38 tam üniteler (içerik)

- [ ] 10.1 Konu 26 Modalverben (Kalan Üniteler s. 3–8): tam anlatım, örnekler, egzersiz.
- [ ] 10.2 Konu 27 Trennbare Verben (s. 19–46): tam anlatım (uzun ünite, birden çok bölüm).
- [ ] 10.3 Konu 28–29 (Saat/Uhrzeit, Präteritum sein/haben).
- [ ] 10.4 Konu 30–32 (Artikel/Dativ, Dativ edatları, Genitiv).
- [ ] 10.5 Konu 33–35 (Aile, Demonstrativpronomen, Imperative; Imperative sayfası belirsiz: kaynakta bul, bulunamazsa Perplexity ile doğrula ve etiketle).
- [ ] 10.6 Konu 36 Das Perfekt (s. 96–112): tam anlatım (uzun ünite, birden çok bölüm).
- [ ] 10.7 Konu 37–38 (Zuerst/Dann/Danach, Einen Brief schreiben).
- [ ] 10.8 Her konunun egzersizini bağla / yaz; kapsama testi: anlatımsız konu 26–38 sayısı 0; `derin-kontrol.js` sıfır hata.

## 11. Teil-2 (B1) içeriği

- [x] 11.1 `KONULAR`'a 45'ten başlayan Teil-2 girişlerini ekle (kod); `kaynak:{p:'t2'}`; `gece-testi.js` ve kapsama testi sıfır hata.
- [ ] 11.2 Genitiv Präpositionen (`icerik/temiz/teil2.txt` satır 8 ve devamı) — içerik.
- [ ] 11.3 Zweiteilige Konjunktionen (satır 301 civarı) — içerik.
- [ ] 11.4 Konjunktiv II (satır 542 civarı) — içerik, hatırlatma + Präteritum/Modalverben bağlantısı.
- [ ] 11.5 Plusquamperfekt (Kapitel 4, satır 430 civarı) — içerik; kaynakta bölüm bulunamazsa Perplexity ile doğrula ve etiketle.
- [ ] 11.6 Futur I (mevcut `futur` slaytına bağla) ve Futur II (satır 977 civarı) — içerik.
- [ ] 11.7 Her konu için egzersiz seti yaz ve bağla; kapsama: Teil-2 konu sayısı 6, anlatımsız konu 0, kaynak etiketsiz madde 0.

## 12. Özgün A1 sınav soruları (içerik)

- [ ] 12.1 Resmî sağlayıcıların ücretsiz model sınav sayfalarının bağlantılarını derle (Goethe, telc, ÖSD) ve Sınav sekmesine koy; içerik kopyalama yok.
- [ ] 12.2 Hören: Teil 1/2/3 biçiminde özgün diyalog, anons ve konuşma metinleri yaz (görev 1.6'daki birebir maddelerin yerine).
- [ ] 12.3 Lesen: 3 bölüm biçiminde özgün kısa metin, ilan ve işaret soruları.
- [ ] 12.4 Schreiben: form doldurma ve kısa mesaj görevleri, ölçüt listesiyle.
- [ ] 12.5 Birebir maddelerin kaldırıldığını doğrulayan kontrol (resmî metinle karşılaştırma) ve `horen-testi.js` sıfır hata.
- [ ] 12.6 Akşam sınavı için konu bazlı özgün soru havuzu (konu 1–38 + Teil-2).

## 13. İlk görsel anlatım seti (içerik + görsel)

- [ ] 13.1 Bağlaçlar: weil / denn / dann / deshalb mevcut kart ve slaytı yeni sayfa türleriyle (fiil sırası şeması) yeniden düzenle.
- [ ] 13.2 weshalb / deswegen / darum anlatım sayfaları (NotebookLM + gerekirse Perplexity doğrulaması).
- [ ] 13.3 dass / obwohl / wenn–als anlatım sayfaları (fiil sona gider şeması, wenn/als karşılaştırma tablosu).
- [ ] 13.4 Bağlaçlar için egzersiz seti (karıştırılan çiftlerde yanlış şık açıklamalı).
- [ ] 13.5 Präteritum: düzenli kalıp, düzensiz fiil listesi, Präteritum–Perfekt zaman çizgisi; kaynak: Kalan Üniteler + NotebookLM.
- [ ] 13.6 Präteritum egzersiz seti.
- [ ] 13.7 `derin-kontrol.js` ve `gece-testi.js` sıfır hata; iki temada ekran görüntüleri.

## 14. Ders medyası içeriği

- [ ] 14.1 Görev 2.6 sonucuna göre podcast üretimini konu konu yürüt (yalnız doğrulanmış olanlar yayınlanır).
- [ ] 14.2 NotebookLM flashcard/quiz çıktılarını doğrula ve konu egzersizlerine dönüştür.
- [ ] 14.3 Zihin haritası ve rapor/çalışma kılavuzunu uygun konularda ders sayfasına bağla; görseldeki Almanca yazıyı harf harf doğrula.
- [ ] 14.4 Podcast dosyalarının depolama yerini (depo veya Supabase Storage) uygula; çevrimdışı davranışı Playwright ile doğrula.

## 15. Kapanış

- [ ] 15.1 `CHANGELOG`'a girdi ekle (ana ekran altı), kullanıcıya görünen her yeni özellik için.
- [ ] 15.2 `sw.js` önbellek sürümünü artır ve uygulamanın çevrimdışı açıldığını Playwright ile doğrula.
- [ ] 15.3 `index.html` boyutunu ve satır sayısını başlangıçla karşılaştır; veri ayırma ihtiyacı varsa not düş.
- [ ] 15.4 Eski değişiklik `ogretme-dongusu-ve-takvim` içindeki devredilen görevleri (3.3–3.6, 6.1–6.5) ve bayatlamış dinleme görevlerini (7.x) işaretle.
- [ ] 15.5 Bellek dosyasını (MEMORY.md) bu değişikliğin kararlarıyla güncelle.
- [ ] 15.6 Tüm test araçlarını son kez çalıştır: `gece-testi.js`, `kapsama-testi.js`, `derin-kontrol.js`, `horen-testi.js`, `supabase-testi.js`, `gun-akisi-testi.js` — hepsi sıfır hata.
- [ ] 15.7 Commit ve push (yalnız ilgili dosyalar; `Almanca-A1/` ve `.claude/` eklenmez); canlı sitede doğrula.
