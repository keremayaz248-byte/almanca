## Purpose

Konu anlatımını tek biçimle sınırlamayıp NotebookLM'in üretebildiği farklı biçimlerle (podcast, flashcard, quiz, zihin haritası, rapor) zenginleştirir; kullanıcı aynı konuyu dinleyerek, görerek ve çözerek anlayabilsin.

## ADDED Requirements

### Requirement: Konuya bağlı podcast dinlenebilir

Sistem, hazırlanmış bir konunun podcast'ini (sesli özet) konu sayfasından oynatılabilir hâlde sunmalıdır. Podcast oynatıcısı duraklatma, geri/ileri sarma ve oynatma hızı sunmalıdır. Podcast yoksa konu sayfası bozulmamalı ve oynatıcı gösterilmemelidir. (MUST)

#### Scenario: Podcast oynatılır

- **WHEN** kullanıcı podcast'i olan bir konunun sayfasında oynat düğmesine basar
- **THEN** ses çalar ve kullanıcı duraklatabilir, sarabilir ve hızı değiştirebilir

#### Scenario: Podcast yok

- **WHEN** kullanıcı podcast'i olmayan bir konuyu açar
- **THEN** sayfa podcast alanı olmadan düzgün görünür

#### Scenario: İnternet yok

- **WHEN** kullanıcı çevrimdışıyken podcast oynatmayı dener
- **THEN** uygulama sesin indirilemediğini Türkçe bir mesajla söyler; konunun yazılı anlatımı çalışmaya devam eder

### Requirement: Podcast içeriği kaynağa uygun ve doğrulanmıştır

Sistem, bir podcast'i yayınlamadan önce dilinin Türkçe (açıklama) ve Almanca örneklerin telaffuzunun anlaşılır olduğunun örnek dinlemeyle doğrulanmış olmasını gerektirmelidir. Doğrulanamayan podcast yayınlanmamalıdır. (MUST)

#### Scenario: Doğrulanmış podcast

- **WHEN** bir konu için podcast üretilmiş ve dinlenerek doğrulanmıştır
- **THEN** podcast ders sayfasına eklenir ve kaynak etiketi NotebookLM'dir

#### Scenario: Telaffuz bozuk

- **WHEN** örnek dinlemede Almanca kelimeler anlaşılmaz okunur
- **THEN** o podcast yayınlanmaz ve yalnız yazılı anlatım kullanılır

### Requirement: Üretilen flashcard ve quiz egzersize dönüşür

Sistem, NotebookLM'den alınan flashcard ve quiz maddelerini, her madde doğrulandıktan sonra, konunun mevcut egzersiz biçimlerine (kelime kartı, çoktan seçmeli) dönüştürerek sunmalıdır. (MUST)

#### Scenario: Flashcard egzersizde

- **WHEN** bir konunun flashcard'ları hazırlanmıştır
- **THEN** kullanıcı bunları konunun egzersiz adımında çalışabilir

### Requirement: Görsel içinde Almanca yazı kullanılmadan önce harf harf doğrulanır

Sistem, NotebookLM veya başka bir yapay zekâ aracının ürettiği bir görselin (infografik, video, slayt) içinde Almanca yazı varsa bunu yayınlamadan önce harf harf doğrulanmış olarak göstermelidir. Doğrulanamayan görsel yayınlanmamalıdır. (MUST)

#### Scenario: Görseldeki yazı bozuk

- **WHEN** üretilmiş bir görselde Almanca bir kelime hatalı yazılmıştır
- **THEN** o görsel yayınlanmaz; aynı bilgi kodla çizilmiş bir şemayla gösterilir
