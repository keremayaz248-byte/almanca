## Purpose

Ders içeriğinin hocanın PDF'lerinden, NotebookLM ve gerektiğinde Perplexity ile doğrulanarak üretilmesini ve siteye statik olarak, güvenli şekilde girmesini sağlar. Kullanıcı kod bilmediği için, bozuk içeriğin siteyi çökertmemesi ve hesap bilgilerinin sızmaması öncelikli güvencedir.

## ADDED Requirements

### Requirement: Kaynak sırası NotebookLM, sonra Perplexity

Sistem, yeni bir konunun içeriğini hazırlarken önce NotebookLM'deki kaynak (hocanın PDF'i) üzerinden çıkarım yapmalı; NotebookLM yetersiz kaldığında veya doğrulama gerektiğinde Perplexity'ye başvurmalıdır. (MUST)

#### Scenario: NotebookLM yeterli

- **WHEN** bir konunun anlatımı için NotebookLM kaynaktan tutarlı bir cevap verir
- **THEN** içerik o cevaba dayanır ve kaynak etiketi NotebookLM + PDF sayfasıdır

#### Scenario: NotebookLM takılır

- **WHEN** NotebookLM bir kuralı kaynaktan doğrulayamaz veya sayfa okunamaz
- **THEN** Perplexity'ye sorulur ve içeriğin kaynak etiketi Perplexity olarak işaretlenir

### Requirement: NotebookLM okuma doğruluğu önce örnekle test edilir

Sistem, bir PDF'in tamamı yüklenmeden önce, görsel ağırlıklı ve harf bozulması olan bir örnek sayfayla NotebookLM'in sayfayı doğru okuyup okumadığını doğrulamalıdır. Doğru okuyamıyorsa o sayfalar için önceden temizlenmiş metin veya görsel okuma kullanılmalıdır. (MUST)

#### Scenario: Örnek sayfa doğru okunur

- **WHEN** örnek sayfa için NotebookLM'in cevabı sayfadaki metinle eşleşir
- **THEN** o PDF NotebookLM'de toplu olarak kullanılır

#### Scenario: Örnek sayfa yanlış okunur

- **WHEN** NotebookLM'in cevabı sayfadaki metinden sapar
- **THEN** o PDF için temizlenmiş metin kaynağı kullanılır ve sapma not edilir

### Requirement: Telifli resmî sınav materyali yayınlanmaz

Sistem, Goethe-Institut, telc ve ÖSD gibi resmî sınav sağlayıcılarının model sınavlarının metinlerini, ses kayıtlarını, çözümlerini ve görsellerini herkese açık yayında birebir bulundurmamalıdır. Biçim örnek alınabilir; metinler özgün yazılmalıdır. Daha önce birebir alınmış içerik özgün içerikle değiştirilmelidir. (MUST)

#### Scenario: Birebir içerik taranır

- **WHEN** yayındaki sınav soruları resmî model sınav metinleriyle karşılaştırılır
- **THEN** birebir eşleşen soru kalmamıştır

#### Scenario: Resmî materyale bağlantı

- **WHEN** kullanıcı gerçek model sınavı görmek ister
- **THEN** uygulama resmî sağlayıcının ücretsiz sayfasına bağlantı verir, içeriği kopyalamaz

### Requirement: NotebookLM üretimleri kaynağa karşı doğrulanır

Sistem, NotebookLM'den alınan her çıktıyı (anlatım, quiz, flashcard, podcast metni, zihin haritası) kaynak PDF sayfasıyla karşılaştırıp doğrulamadan yayınlamamalıdır. Çıktı kaynakla çelişirse kaynak esas alınmalıdır. (MUST)

#### Scenario: Çıktı kaynakla uyuşur

- **WHEN** bir NotebookLM çıktısı kaynak sayfadaki kuralla uyuşur
- **THEN** çıktı yayına alınabilir ve kaynak etiketi taşır

#### Scenario: Çıktı kaynakla çelişir

- **WHEN** bir NotebookLM çıktısı kaynak sayfadaki kuralla çelişir
- **THEN** çıktı yayınlanmaz; kaynak esas alınır ve çelişki not edilir

### Requirement: Canlı üçüncü taraf bağlantısı siteye eklenmez

Sistem, yayınlanan sitede NotebookLM veya Perplexity'ye canlı bağlantı, kullanıcıya ait giriş çerezi ya da anahtar bulundurmamalıdır. İçerik önceden hazırlanıp statik olarak gömülmelidir. (MUST)

#### Scenario: Yayındaki sitede anahtar yok

- **WHEN** yayınlanan dosyalar incelenir
- **THEN** bu araçlara ait giriş bilgisi, çerez veya anahtar bulunmaz

### Requirement: Giriş verileri depoya girmez

Sistem, Perplexity oturum profilini ve diğer araç yan ürünlerini sürüm kontrolüne eklememelidir. (MUST)

#### Scenario: Yerel profil yok sayılır

- **WHEN** depoda değişiklikler listelenir
- **THEN** Perplexity oturum klasörü ve geçici ekran görüntüleri izlenmeyen dosya olarak sürüm kontrolüne alınmaz

### Requirement: İçerik parti hâlinde eklenir ve doğrulanır

Sistem, yeni içeriği otonom olarak değil, küçük partiler hâlinde eklemeli ve her partiden sonra sözdizimi ve içerik testlerinin sıfır hatayla geçtiğini doğrulamadan yayınlamamalıdır. (MUST)

#### Scenario: Test geçmezse yayın olmaz

- **WHEN** bir içerik partisinden sonra sözdizimi veya içerik testi hata verir
- **THEN** parti yayınlanmaz ve hata giderilir

### Requirement: Her içerik maddesi kaynağını taşır

Sistem, eklenen her kural, örnek ve soru için kaynağı (PDF sayfası, NotebookLM, Perplexity) kayıt altında tutmalıdır. (MUST)

#### Scenario: Kaynak sorgulanır

- **WHEN** bir maddenin nereden geldiği sorulur
- **THEN** madde için bir PDF sayfası ya da araç adı bulunabilir
