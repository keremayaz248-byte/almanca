## Purpose

Kullanıcının Almancayı metne bakmadan, yalnız sesten anlama becerisini çalıştırır. Sınavın Hören bölümü yazılı destek olmadan dinlediğini anlamayı ölçtüğü için, bu yetenek sesi tek bilgi kaynağı yapar ve metni ancak cevap verildikten sonra açar.

## ADDED Requirements

### Requirement: Ses tek bilgi kaynağıdır

Sistem, dinleme sorusu sorulurken Almanca metni ekranda göstermemelidir. Kullanıcı cevabını verene kadar metin, çevirisi ve metni ele veren herhangi bir ipucu gizli kalmalıdır. (MUST)

#### Scenario: Soru sorulurken metin gizli

- **WHEN** kullanıcı bir dinleme sorusuna geçer
- **THEN** ekranda Almanca metin görünmez, yalnız dinleme düğmesi ve cevap alanı görünür

#### Scenario: Cevaptan sonra metin açılır

- **WHEN** kullanıcı cevabını gönderir
- **THEN** Almanca metin ve Türkçe çevirisi ekranda gösterilir, böylece ne duyduğunu kontrol edebilir

### Requirement: Kullanıcı sesi sınırsız tekrar dinleyebilir

Sistem, kullanıcının aynı sesi istediği kadar yeniden dinlemesine izin vermelidir. Dinleme sayısı cevabın doğruluğunu veya puanı etkilememelidir. (MUST)

#### Scenario: Tekrar dinleme

- **WHEN** kullanıcı dinleme düğmesine birden çok kez basar
- **THEN** ses her seferinde baştan çalar ve cevap hakkı eksilmez

#### Scenario: Yavaş dinleme

- **WHEN** kullanıcı yavaş dinleme seçeneğini kullanır
- **THEN** aynı metin normalden düşük hızda seslendirilir

### Requirement: Dinleme cevabı değerlendirilir ve açıklanır

Sistem, kullanıcının cevabını doğru/yanlış olarak değerlendirmeli ve yanlışsa doğru cevabı göstermelidir. Yazarak cevaplanan sorularda küçük yazım sapmaları doğru sayılmalıdır. (MUST)

#### Scenario: Doğru cevap

- **WHEN** kullanıcının cevabı beklenen cevapla eşleşir
- **THEN** sistem cevabı doğru işaretler ve kullanıcıya XP verir

#### Scenario: Küçük yazım hatası

- **WHEN** kullanıcı beklenen cevabı küçük bir harf hatasıyla yazar
- **THEN** sistem cevabı doğru sayar ve doğru yazımı da gösterir

#### Scenario: Yanlış cevap

- **WHEN** kullanıcının cevabı beklenen cevapla eşleşmez
- **THEN** sistem doğru cevabı, tam metni ve çevirisini gösterir

### Requirement: Seslendirme desteklenmeyen cihazda mod erişilemez olur

Sistem, tarayıcı Almanca seslendirmeyi desteklemiyorsa dinleme modunu kullanıma açmamalı ve kullanıcıya sebebini Türkçe açıklamalıdır. Sessiz bir şekilde boş ekran gösterilmemelidir. (MUST)

#### Scenario: Seslendirme yok

- **WHEN** kullanıcı seslendirmeyi desteklemeyen bir tarayıcıda dinleme modunu açmaya çalışır
- **THEN** sistem modu başlatmaz ve cihazın seslendirmeyi desteklemediğini belirten bir mesaj gösterir

### Requirement: Dinleme ilerlemesi aralıklı tekrara dahil edilir

Sistem, dinleme sorularının sonucunu kalıcı olarak kaydetmeli ve yanlış bilinen dinleme içeriğini ileride tekrar sormalıdır. (MUST)

#### Scenario: Yanlış bilinen tekrar gelir

- **WHEN** kullanıcı bir dinleme sorusunu yanlış cevaplar ve daha sonra dinleme moduna tekrar girer
- **THEN** o içerik doğru bilinenlerden önce yeniden sorulur
