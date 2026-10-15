## Purpose

Bir konunun baştan sona nasıl çalışıldığını tanımlar: önce anlatım, sonra o konunun kelimeleri, sonra o konuya uygun alıştırmalar, en sonda konu testi. Amaç, kullanıcının bir konuya girdiğinde ne yapacağını aramak zorunda kalmaması ve konunun bittiğini net olarak görmesidir.

## ADDED Requirements

### Requirement: Konu dört adımlı sabit bir sırayla çalışılır

Sistem, her konuyu anlatım → kelimeler → alıştırma → test sırasıyla sunmalıdır. Kullanıcı bir sonraki adıma geçmek için menüye dönmek zorunda kalmamalı, adımlar arasındaki geçiş konu ekranından yapılabilmelidir. (MUST)

#### Scenario: Konuya ilk giriş

- **WHEN** kullanıcı daha önce hiç çalışmadığı bir konuya girer
- **THEN** sistem onu konunun anlatım adımına yönlendirir

#### Scenario: Adımlar arası geçiş

- **WHEN** kullanıcı bir adımı bitirir
- **THEN** sistem bir sonraki adımı başlatan bir seçenek sunar

#### Scenario: Kaldığı yerden devam

- **WHEN** kullanıcı yarım bıraktığı bir konuya geri döner
- **THEN** sistem konunun hangi adımında kaldığını gösterir ve oradan devam etmesini sağlar

### Requirement: Her konunun kendi alıştırma tipleri bulunur

Sistem, bir konunun alıştırma adımında o konunun içeriğine uygun egzersiz tiplerini çalıştırmalıdır. Konuyla ilgisiz bir egzersiz tipi o konunun adımında sunulmamalıdır. (MUST)

#### Scenario: Edat konusu

- **WHEN** kullanıcı bir edat konusunun alıştırma adımına geçer
- **THEN** edat boşluk doldurma egzersizi çalışır

#### Scenario: Artikel konusu

- **WHEN** kullanıcı artikel (cinsiyet) konusunun alıştırma adımına geçer
- **THEN** der/die/das egzersizi çalışır

#### Scenario: Çoğul konusu

- **WHEN** kullanıcı çoğul konusunun alıştırma adımına geçer
- **THEN** çoğul yapma egzersizi çalışır

#### Scenario: Kelime ağırlıklı konu

- **WHEN** kullanıcı kelime ağırlıklı bir konunun (renkler, kıyafet, aile gibi) alıştırma adımına geçer
- **THEN** o kategorinin kelime egzersizi çalışır

### Requirement: Konunun tamamlanma durumu görünür

Sistem, her konunun hangi durumda olduğunu kullanıcıya göstermelidir: hiç başlanmadı, devam ediyor, tamamlandı veya tekrarı geldi. (MUST)

#### Scenario: Konu listesinde durum

- **WHEN** kullanıcı konu listesini açar
- **THEN** her konunun yanında o konunun durumu görünür

#### Scenario: Konu tamamlanır

- **WHEN** kullanıcı bir konunun testini başarıyla bitirir
- **THEN** konu tamamlandı olarak işaretlenir ve tekrar zamanı belirlenir

### Requirement: Tamamlanan konu aralıklı tekrara girer

Sistem, tamamlanan konuyu kalıcı olarak bitmiş saymamalı, belirli aralıklarla tekrar kullanıcının karşısına çıkarmalıdır. (MUST)

#### Scenario: Tekrarı gelen konu

- **WHEN** tamamlanmış bir konunun tekrar zamanı gelir
- **THEN** konu listesinde tekrarı geldi olarak işaretlenir

#### Scenario: Tekrar sonucu aralığı değiştirir

- **WHEN** kullanıcı tekrarı gelen bir konuyu yeniden çalışır
- **THEN** sonuca göre bir sonraki tekrar zamanı ileri veya geri alınır

### Requirement: Konu ilerlemesi kalıcı olarak saklanır

Sistem, kullanıcının her konudaki adım ve tamamlanma bilgisini oturum kapansa da korumalıdır. Mevcut kayıtlı ilerleme bu yapı devreye girdiğinde silinmemelidir. (MUST)

#### Scenario: Oturum kapanıp açılır

- **WHEN** kullanıcı uygulamayı kapatıp yeniden açar
- **THEN** konulardaki ilerlemesi ve tekrar zamanları korunmuş olur

#### Scenario: Eski ilerleme korunur

- **WHEN** daha önce kelime ve gramer çalışmış bir kullanıcı yeni yapıyla uygulamayı açar
- **THEN** eski ilerlemesi silinmez
