## Purpose

Kullanıcının uygulamada "ne nerede" sorusunu cevaplayabilmesini sağlar. Bugün ana ekranda birbirine karışmış çok sayıda giriş noktası var ve hangisinin hangi konuya ait olduğu belli değil. Amaç, günlük çalışmayı tek bir akışta toplamak, ek çalışma araçlarını ayrı ve ikincil bir yere koymaktır.

## ADDED Requirements

### Requirement: Ana ekran günlük çalışma, konular ve ek çalışma olarak ayrılır

Sistem, ana ekranı birbirinden açıkça ayrılmış bölümler halinde sunmalıdır: o gün yapılacak çalışma, konu listesi ve ek çalışma araçları. Bu bölümler başlıklarıyla ayırt edilebilmelidir. (MUST)

#### Scenario: Ana ekran açılır

- **WHEN** kullanıcı ana ekranı açar
- **THEN** o günün çalışması, konu listesi ve ek çalışma bölümleri ayrı başlıklar altında görünür

#### Scenario: Günlük çalışma önce gelir

- **WHEN** kullanıcı ana ekranı açar
- **THEN** o günün çalışması, ek çalışma araçlarından önce ve daha belirgin biçimde görünür

### Requirement: Günlük akış tek başına yeterlidir

Sistem, kullanıcının yalnız günlük akışı takip ederek o günün çalışmasını baştan sona tamamlayabilmesini sağlamalıdır. Kullanıcı günün çalışmasını yapmak için ek çalışma bölümüne girmek zorunda kalmamalıdır. (MUST)

#### Scenario: Günü takip etmek yeterli

- **WHEN** kullanıcı o günün çalışmasını başlatır ve sonuna kadar takip eder
- **THEN** o gün için planlanan tüm adımları ek bir yere gitmeden tamamlamış olur

### Requirement: Ek çalışma araçları ikincil ve düzenli sunulur

Sistem, günlük akışın parçası olmayan serbest çalışma araçlarını ayrı bir bölümde, türlerine göre gruplanmış biçimde sunmalıdır. Bu araçlar ana ekranı günlük akıştan uzaklaştıracak kadar öne çıkmamalıdır. (MUST)

#### Scenario: Ek çalışma bölümü

- **WHEN** kullanıcı ek çalışma bölümünü açar
- **THEN** serbest çalışma araçları türlerine göre gruplanmış olarak listelenir

#### Scenario: Hiçbir araç kaybolmaz

- **WHEN** yeni düzen devreye girer
- **THEN** önceden erişilebilen her çalışma aracına hâlâ erişilebilir

### Requirement: Her içeriğin tek bir yeri vardır

Sistem, aynı içeriği birbirinden kopuk birden çok giriş noktasından sunmamalıdır. Bir konunun anlatımı, kelimesi ve alıştırması o konunun altında toplanmalıdır. (MUST)

#### Scenario: Konuya ait içerik konunun altındadır

- **WHEN** kullanıcı bir konuyu açar
- **THEN** o konunun anlatımı, kelimeleri ve alıştırmaları aynı yerde bulunur

### Requirement: Kullanıcı nerede olduğunu her ekranda görebilir

Sistem, kullanıcının bulunduğu ekranın hangi konuya veya hangi güne ait olduğunu göstermelidir ve bir önceki adıma dönmesini sağlamalıdır. (MUST)

#### Scenario: Alıştırma ekranında bağlam

- **WHEN** kullanıcı bir konunun alıştırmasını yapmaktadır
- **THEN** ekranda hangi konunun alıştırmasında olduğu görünür

#### Scenario: Geri dönüş

- **WHEN** kullanıcı bir alt ekrandadır
- **THEN** geldiği yere dönmesini sağlayan bir seçenek bulunur
