## Purpose

Bir kelimenin "öğrenildi" sayılması için kullanıcının geçmesi gereken aşamaları ve bu aşamaların sırasını tanımlar. Amaç, kelimeyi yalnız şıklardan tanımaktan çıkarıp hem bağlam içinde görmeyi hem de Almancasını kendi yazmayı zorunlu kılmaktır.

## ADDED Requirements

### Requirement: Kullanıcı her kelimenin Almancasını en az bir kez kendi yazar

Sistem, bir kelimeyi "öğrenildi" saymadan önce kullanıcıdan o kelimenin Almancasını şık görmeden yazmasını istemelidir. Yalnızca çoktan seçmeli tanıma ve Türkçe karşılık yazma, kelimeyi öğrenilmiş saymak için yeterli olmamalıdır. (MUST)

#### Scenario: Türkçeden Almancaya yazma aşaması

- **WHEN** kullanıcı bir kelimede tanıma aşamalarını geçer
- **THEN** sistem Türkçe anlamı gösterir ve kullanıcıdan Almancasını şık vermeden yazmasını ister

#### Scenario: Doğru Almanca yazım

- **WHEN** kullanıcı kelimenin Almancasını doğru yazar
- **THEN** sistem cevabı doğru işaretler ve kelimeyi bir sonraki aşamaya geçirir

#### Scenario: Yanlış Almanca yazım

- **WHEN** kullanıcı kelimenin Almancasını yanlış yazar
- **THEN** sistem doğru yazımı gösterir, kelimeyi öğrenilmiş saymaz ve aynı oturum içinde tekrar sorar

### Requirement: Almanca yazımda artikel ve umlaut değerlendirilir

Sistem, Almanca yazma aşamasında anlamı değiştiren farkları hata saymalı, anlamı değiştirmeyen küçük sapmaları ise kabul edip doğrusunu göstermelidir. İsimlerde artikel (`der`/`die`/`das`) ve harflerdeki umlaut işaretleri anlam taşıyan bilgi olarak ele alınmalıdır. (MUST)

#### Scenario: Umlaut eksik yazılmış

- **WHEN** kullanıcı umlaut içeren bir kelimeyi umlautsuz yazar
- **THEN** sistem cevabı kabul eder ancak doğru yazımı umlautlu biçimiyle vurgulayarak gösterir

#### Scenario: İsimde yanlış artikel

- **WHEN** kullanıcı bir ismi yanlış artikelle yazar
- **THEN** sistem doğru artikeli gösterir ve kelimeyi bu aşamada öğrenilmiş saymaz

### Requirement: Her kelimenin bir bağlam cümlesi bulunur

Sistem, kullanıcıya gösterdiği her kelime için o kelimenin geçtiği en az bir Almanca örnek cümleyi Türkçe çevirisiyle birlikte sunabilmelidir. Hiçbir kelime kullanıcıya yalnız sözlük karşılığıyla, hiç cümle görmeden öğretilmemelidir. (MUST)

#### Scenario: Tanıtım kartında bağlam

- **WHEN** kullanıcıya daha önce hiç görmediği bir kelime tanıtılır
- **THEN** kelimenin anlamı ve ipucuyla birlikte içinde geçtiği örnek cümle ve çevirisi gösterilir

#### Scenario: Yanlış cevapta bağlam

- **WHEN** kullanıcı bir kelimeyi yanlış cevaplar
- **THEN** geri bildirimde doğru cevapla birlikte kelimenin bağlam cümlesi de gösterilir

### Requirement: Aşama ilerlemesi kalıcı olarak saklanır

Sistem, kullanıcının her kelimede hangi aşamada olduğunu ve aralıklı tekrar bilgisini oturum kapansa da korumalıdır. Mevcut kayıtlı ilerleme, yeni aşama eklenmesi nedeniyle silinmemeli veya sıfırlanmamalıdır. (MUST)

#### Scenario: Oturum kapanıp açılır

- **WHEN** kullanıcı uygulamayı kapatıp yeniden açar
- **THEN** daha önce öğrendiği kelimeler ve tekrar zamanları korunmuş olur

#### Scenario: Eski ilerleme korunur

- **WHEN** yeni aşama devreye girdikten sonra daha önce öğrenilmiş kelimeleri olan bir kullanıcı uygulamayı açar
- **THEN** eski ilerlemesi silinmez ve kullanıcı sıfırdan başlamak zorunda kalmaz
