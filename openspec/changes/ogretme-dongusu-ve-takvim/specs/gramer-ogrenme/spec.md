## Purpose

Gramer sorularında kullanıcının yaptığı hatanın sebebini açıklamayı ve öğrenilen gramer konusunun zamanla tekrar karşısına çıkmasını tanımlar. Amaç, doğru cevabı söylemekle yetinmeyip kullanıcının kafasındaki yanlış kuralı düzeltmek ve konuyu bir kez çözülüp unutulan bir şey olmaktan çıkarmaktır.

## ADDED Requirements

### Requirement: Yanlış şıkkın neden yanlış olduğu açıklanır

Sistem, kullanıcı bir gramer sorusunda yanlış şık seçtiğinde, yalnız doğru cevabı bildirmekle kalmayıp **kullanıcının seçtiği şıkkın** neden yanlış olduğunu da açıklamalıdır. Açıklama o şıkka özel olmalı, tüm yanlış şıklar için aynı genel metin kullanılmamalıdır. (MUST)

#### Scenario: Yanlış şık seçilir

- **WHEN** kullanıcı bir gramer sorusunda yanlış bir şık seçer
- **THEN** sistem seçilen şıkkın neden yanlış olduğunu o şıkka özel bir açıklamayla gösterir

#### Scenario: Doğru cevap da açıklanır

- **WHEN** kullanıcı bir gramer sorusunu yanlış cevaplar
- **THEN** sistem yanlış şıkkın açıklamasıyla birlikte doğru cevabın hangi kurala dayandığını da gösterir

#### Scenario: Doğru cevapta kural hatırlatılır

- **WHEN** kullanıcı bir gramer sorusunu doğru cevaplar
- **THEN** sistem cevabı doğru işaretler ve arkasındaki kuralı kısaca hatırlatır

### Requirement: Gramer konuları aralıklı tekrara girer

Sistem, kullanıcının çözdüğü gramer konularının sonucunu kaydetmeli ve konuyu belirli aralıklarla tekrar karşısına çıkarmalıdır. Bir konunun bir kez çözülmesi, o konunun kalıcı olarak tamamlanmış sayılması anlamına gelmemelidir. (MUST)

#### Scenario: Doğru bilinen konunun tekrarı ertelenir

- **WHEN** kullanıcı bir gramer konusunu yüksek doğrulukla çözer
- **THEN** o konunun bir sonraki tekrar zamanı ileri bir tarihe atılır

#### Scenario: Yanlış yapılan konu yakında geri gelir

- **WHEN** kullanıcı bir gramer konusunda çok sayıda yanlış yapar
- **THEN** o konunun tekrar zamanı yakın bir tarihe çekilir

### Requirement: Tekrarı gelen gramer konuları kullanıcıya bildirilir

Sistem, tekrar zamanı gelmiş gramer konusu olduğunda bunu kullanıcıya görünür biçimde belirtmeli ve doğrudan o konuya geçmesini sağlamalıdır. (MUST)

#### Scenario: Tekrar bekleyen konu var

- **WHEN** kullanıcının tekrar zamanı gelmiş en az bir gramer konusu varken ana ekranı açar
- **THEN** sistem kaç konunun tekrarının geldiğini gösterir ve o konulara geçiş imkânı sunar

#### Scenario: Tekrar bekleyen konu yok

- **WHEN** kullanıcının tekrar zamanı gelmiş gramer konusu yokken ana ekranı açar
- **THEN** sistem tekrar uyarısı göstermez

### Requirement: Gramer ilerlemesi kalıcı olarak saklanır

Sistem, her gramer konusundaki doğru/yanlış geçmişini ve tekrar zamanını oturum kapansa da korumalıdır. (MUST)

#### Scenario: Oturum kapanıp açılır

- **WHEN** kullanıcı uygulamayı kapatıp yeniden açar
- **THEN** gramer konularındaki ilerlemesi ve tekrar zamanları korunmuş olur
