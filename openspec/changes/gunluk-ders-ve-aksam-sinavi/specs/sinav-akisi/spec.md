## Purpose

Goethe Start Deutsch 1 biçimindeki Hören, Lesen ve Schreiben bölümlerini gerçek sınav sırasıyla ve sonuç geçmişiyle sunar. Bugün bu bölümler bağımsız rastgele quizler; sonuç kaydedilmiyor ve zayıf konu derse geri dönmüyor.

## ADDED Requirements

### Requirement: Sınav bölümleri gerçek sınav sırasıyla çalışır

Sistem, bir sınav oturumunda Hören sorularını Teil 1, Teil 2, Teil 3 sırasıyla vermelidir; bölümler birbirine karışmamalıdır. (MUST)

#### Scenario: Hören oturumu

- **WHEN** kullanıcı bir Hören sınav oturumu başlatır
- **THEN** önce Teil 1 soruları, ardından Teil 2, ardından Teil 3 soruları gelir

#### Scenario: Bölüm başlığı görünür

- **WHEN** oturum bir sonraki Teil'e geçer
- **THEN** ekranda hangi Teil'de olunduğu ve o Teil'in nasıl cevaplandığı kısaca belirtilir

### Requirement: Üç beceri tek deneme sınavında birleştirilebilir

Sistem, Hören, Lesen ve Schreiben bölümlerini peş peşe tek bir deneme sınavı olarak çalıştırma seçeneği sunmalıdır; sonunda bölüm başına ve toplam sonuç gösterilmelidir. (MUST)

#### Scenario: Deneme sınavı bitirilir

- **WHEN** kullanıcı üç bölümü de bitirir
- **THEN** her bölümün doğru sayısı ve toplam sonuç tek ekranda görünür

### Requirement: Sınav sonuçları kaydedilir

Sistem, her sınav oturumunun tarihini, bölümünü ve sonucunu cihazda saklamalı ve kullanıcı geçmiş sonuçlarını görebilmelidir. (MUST)

#### Scenario: Sonuç geçmişi

- **WHEN** kullanıcı bir oturumu bitirir ve sonra Sınav sekmesini açar
- **THEN** o oturumun tarihi ve sonucu geçmiş listesinde görünür

#### Scenario: Uygulama kapanıp açılır

- **WHEN** kullanıcı uygulamayı kapatıp tekrar açar
- **THEN** geçmiş sonuçlar hâlâ görünür

### Requirement: Yanlış yapılan konu derse geri döner

Sistem, bir sınav sorusu yanlış yapıldığında ilgili konuyu kullanıcının tekrar listesine eklemeli ve sonraki günün çalışmasında ve akşam sınavında o konuya yer vermelidir. (MUST)

#### Scenario: Yanlış yapılan konu işaretlenir

- **WHEN** kullanıcı bir Hören sorusunu yanlış yapar
- **THEN** soruya bağlı konu zayıf konu olarak işaretlenir

#### Scenario: Zayıf konu ertesi gün gelir

- **WHEN** ertesi gün kullanıcı Bugün ekranını açar
- **THEN** zayıf konu için kısa bir tekrar adımı günün içinde yer alır

### Requirement: Ses yoksa mod açıkça bildirilir

Sistem, cihazda Almanca ses bulunmadığında Hören oturumunun metne düştüğünü ya da açılmadığını Türkçe bir mesajla söylemelidir; kullanıcıyı sessizce yanlış dilde sesle karşılamamalıdır. (MUST)

#### Scenario: Almanca ses paketi yok

- **WHEN** kullanıcının cihazında Almanca ses yoktur ve Hören'i başlatır
- **THEN** Türkçe bir uyarı gösterilir ve metin modunda ya da hiç açılmadan devam edilir
