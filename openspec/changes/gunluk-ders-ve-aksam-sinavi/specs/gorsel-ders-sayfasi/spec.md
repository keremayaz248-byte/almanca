## Purpose

Konu anlatımını düz metin yerine, ders kitabı gibi sayfa sayfa gezilen, şema ve tablolarla zenginleştirilmiş bir biçimde sunar. Bugünkü slaytlar yalnız büyük kelime, anlam, iki örnek ve ipucundan oluşuyor; cümle yapısı, fiil sırası ve zaman çizgisi gibi şekil gerektiren konuları taşıyamıyor.

## ADDED Requirements

### Requirement: Konu sayfa sayfa gezilir

Sistem, bir konunun anlatımını sıralı sayfalar halinde sunmalı; kullanıcı ileri ve geri gidebilmeli, kaçıncı sayfada olduğunu görmelidir. (MUST)

#### Scenario: Sayfa gezintisi

- **WHEN** kullanıcı bir konu anlatımını açar
- **THEN** ilk sayfa görünür, ileri ve geri düğmeleri ve "sayfa / toplam" göstergesi bulunur

### Requirement: Almanca yazı şemalarda hatasız ve seçilebilir olur

Sistem, şema, tablo ve cümle yapısı gösterimlerindeki tüm Almanca metni gerçek metin olarak göstermelidir; metin yapay zekâ ile üretilmiş görselin içine gömülmemelidir. (MUST)

#### Scenario: Metin seçilebilir

- **WHEN** kullanıcı bir şemadaki Almanca kelimeyi seçmek ister
- **THEN** kelime gerçek metindir ve seçilebilir

#### Scenario: Koyu temada okunur

- **WHEN** kullanıcı koyu temayı seçer
- **THEN** şemalardaki yazı ve çizgiler zeminle yeterli kontrastta kalır

### Requirement: Cümle yapısı renk koduyla gösterilir

Sistem, bağlaç ve zaman konularında cümle öğelerini (özne, fiil, bağlaç, diğer öğeler) sabit renk ve sıra numarasıyla göstermeli, fiilin hangi sırada durduğunu görsel olarak belli etmelidir. (MUST)

#### Scenario: Bağlaç sonrası fiil sırası

- **WHEN** kullanıcı weil, dass veya obwohl anlatım sayfasını açar
- **THEN** fiilin cümle sonuna gittiği, ana cümledeki yerle karşılaştırmalı bir şemayla gösterilir

#### Scenario: Deshalb / deswegen / darum

- **WHEN** kullanıcı deshalb, deswegen veya darum sayfasını açar
- **THEN** fiilin ikinci sırada kaldığı ve öznenin üçüncü sıraya kaydığı şemayla gösterilir

### Requirement: Präteritum zaman çizgisi ve çekim tablosu içerir

Sistem, Präteritum anlatımında düzenli ve düzensiz fiillerin çekimini tablo olarak, ve ne zaman Präteritum, ne zaman Perfekt kullanıldığını karşılaştırmalı olarak göstermelidir. (MUST)

#### Scenario: Düzenli ve düzensiz ayrımı

- **WHEN** kullanıcı Präteritum anlatımını açar
- **THEN** düzenli fiil kalıbı ve en az bir düzensiz fiil listesi ayrı bölümler olarak görünür

### Requirement: Anlatımın ardından egzersiz bağlanır

Sistem, her anlatım bölümünün sonunda o konunun egzersizine tek dokunuşla geçilen bir düğme sunmalıdır. (MUST)

#### Scenario: Anlatımdan egzersize

- **WHEN** kullanıcı anlatımın son sayfasına gelir
- **THEN** o konunun egzersizini başlatan bir düğme görünür
