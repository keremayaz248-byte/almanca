## Purpose

Çalışmanın birimini "okul günü" yapar: gün içinde konu anlatımı ve egzersiz, akşam sınav. Uygulama oyunlaştırılmış bir yol değil, hocanın materyaline ve sınava dayalı bir program olduğu için, kullanıcı her günün neyi kapsadığını ve nerede kaldığını bilmelidir.

## ADDED Requirements

### Requirement: Bir gün ders ve akşam sınavından oluşur

Sistem, her günü sırayla şu adımlarla sunmalıdır: o günün konusunun anlatımı, o konunun egzersizleri, akşam sınavı. Bugün ekranı bu adımları sıralı olarak ve tamamlanma durumuyla göstermelidir. (MUST)

#### Scenario: Günün adımları görünür

- **WHEN** kullanıcı Bugün ekranını açar
- **THEN** günün anlatım, egzersiz ve akşam sınavı adımları sırayla ve her birinin yapıldı/yapılmadı durumuyla görünür

#### Scenario: Adımlar sırayla ilerler

- **WHEN** kullanıcı bir adımı bitirir
- **THEN** sıradaki adım kendiliğinden önerilir ve kullanıcı adım seçmek zorunda kalmaz

### Requirement: Müfredat konu 1'den başlar ve tam üniteleri kapsar

Sistem, müfredatı şu sırayla işlemelidir: Teil-1 (konu 1–25), Kalan Üniteler (konu 26–38), Teil-2 (B1 konuları). Kalan Üniteler konuları özet kart olarak değil, diğer konular gibi tam anlatım ve egzersizle sunulmalıdır. (MUST)

#### Scenario: Program baştan başlar

- **WHEN** kullanıcı yeni programı başlatır
- **THEN** ilk gün konu 1'den (Alfabe ve Telaffuz) başlar

#### Scenario: Teil-1'den Kalan Üniteler'e geçiş

- **WHEN** Teil-1'in son konusu (konu 25) tamamlanmıştır
- **THEN** sıradaki günlerin konusu Kalan Üniteler'in konu 26'sından (Modalverben) gelir

#### Scenario: Teil-2 A1 bittikten sonra gelir

- **WHEN** Kalan Üniteler'in son konusu (konu 38) tamamlanmıştır
- **THEN** sıradaki günlerin konusu Teil-2'den gelir

#### Scenario: Kalan Üniteler tam anlatılır

- **WHEN** kullanıcı Kalan Üniteler'den bir konuyu (ör. Modalverben, Das Perfekt) açar
- **THEN** konunun anlatımı, örnekleri ve egzersizi diğer Teil-1 konularıyla aynı derinlikte bulunur

### Requirement: Hafif konular birleştirilebilir, yoğun konular bölünebilir

Sistem, bir güne bir veya birden çok konu bağlayabilmeli; çok hafif konuları (ör. selamlaşma) aynı güne toplayabilmeli ve yoğun konuları birden çok güne bölebilmelidir. Tekrar günleri programda bulunmalıdır. (MUST)

#### Scenario: Hafif konular aynı günde

- **WHEN** program ilk günlerin konularını belirler
- **THEN** çok hafif konular aynı günde, yoğun bir konu tek başına bir günde gösterilir

#### Scenario: Tekrar günü

- **WHEN** program belirli bir sayıda konu işledikten sonra gelir
- **THEN** o konuları toplayan bir tekrar günü bulunur

### Requirement: Yarım kalan gün kaybolmaz

Sistem, kullanıcının yarım bıraktığı günü eksik olarak işaretlemeli ve sonradan geri dönüp tamamlanmasına izin vermelidir. (MUST)

#### Scenario: Gün atlanır

- **WHEN** kullanıcı bir günün adımlarını tamamlamadan ertesi güne geçer
- **THEN** eksik gün takvimde eksik olarak görünür ve kullanıcı ona dönüp kalan adımları yapabilir

### Requirement: Gün ilerlemesi cihazda kalıcıdır

Sistem, hangi günlerin ve adımların tamamlandığını cihazda saklamalıdır; uygulama kapatılıp açılsa da durum korunmalıdır. (MUST)

#### Scenario: Uygulama yeniden açılır

- **WHEN** kullanıcı bir adımı bitirip uygulamayı kapatır ve tekrar açar
- **THEN** o adım hâlâ tamamlanmış görünür
