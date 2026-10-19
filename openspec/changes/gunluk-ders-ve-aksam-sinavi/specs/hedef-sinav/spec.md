## Purpose

Kullanıcının hedef sınavını ve sınav tarihini uygulamanın içinde belirlemesini sağlar; böylece program ve motivasyon bu hedefe bağlanır. Hedef şu an bilinmediği için, bir geliştiriciye sorulması gereken bir bilgi olmaktan çıkıp uygulamanın ayarı olur.

## ADDED Requirements

### Requirement: Hedef sınav ve tarih ayarlanabilir

Sistem, kullanıcının hedef sınavı (ör. Goethe-Zertifikat A1, A2, B1; telc; ÖSD; belirsiz) ve sınav tarihini girip değiştirebileceği bir ayar ekranı sunmalıdır. (MUST)

#### Scenario: Ayar girilir

- **WHEN** kullanıcı hedef sınav türünü ve tarihi seçip kaydeder
- **THEN** seçim cihazda saklanır ve uygulama yeniden açıldığında korunur

#### Scenario: Hedef belirsizdir

- **WHEN** kullanıcı hedef sınavı henüz bilmiyorsa "belirsiz" seçer
- **THEN** uygulama normal çalışır ve geri sayım göstermez

### Requirement: İlk akşam sınavının sonunda hedef sorulur

Sistem, hedef girilmemişse, ilk akşam sınavı bittiğinde kullanıcıya hedef sınavı ve tarihi sormalıdır. Kullanıcı sonra cevaplamayı seçebilmelidir. (MUST)

#### Scenario: Hedef sorusu

- **WHEN** kullanıcı ilk akşam sınavını bitirir ve hedef girilmemiştir
- **THEN** hedef sınav ve tarih sorusu görünür; "Sonra" seçeneği vardır

### Requirement: Bugün ekranında geri sayım gösterilir

Sistem, hedef tarih girilmişse Bugün ekranında sınava kalan gün sayısını göstermelidir. (MUST)

#### Scenario: Geri sayım görünür

- **WHEN** kullanıcı hedef tarih girmiştir ve Bugün ekranını açar
- **THEN** sınava kaç gün kaldığı görünür

### Requirement: Hedef ile program uyuşmazlığı açıkça söylenir

Sistem, programın hedef tarihten sonra bittiğini veya programdaki içeriğin hedef sınavın seviyesini aştığını (ör. hedef A1 iken B1 konuları) fark ettiğinde bunu kullanıcıya bir notla söylemelidir; programı kendi başına değiştirmemelidir. (MUST)

#### Scenario: Program hedeften sonra biter

- **WHEN** kalan konuların sayısı hedef tarihe kadar kalan günlere sığmaz
- **THEN** kullanıcıya program hedef tarihten sonra bitecek diye not gösterilir

#### Scenario: Hedef A1, program B1 içeriyor

- **WHEN** hedef sınav A1'dir ve kullanıcı bir Teil-2 (B1) konusunu açar
- **THEN** konunun B1 seviyesinde olduğunu ve A1 sınavında çıkmayabileceğini söyleyen not görünür
