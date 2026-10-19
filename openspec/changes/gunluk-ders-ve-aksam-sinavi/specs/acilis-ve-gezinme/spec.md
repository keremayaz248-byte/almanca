## Purpose

Kullanıcının uygulamayı açtığında "şimdi ne yapacağım" sorusuna tek bakışta cevap bulmasını ve her ekrandan ana bölümlere kolayca ulaşmasını sağlar. Bugün ana ekran tek uzun sayfa ve alt menü yok; amaç kararı ortadan kaldırmak ve gezinmeyi dört sabit bölüme indirmektir.

## ADDED Requirements

### Requirement: Uygulama Bugün ekranına açılır

Sistem, uygulama açıldığında kullanıcıyı "Bugün" ekranına götürmelidir. Bu ekranda günün sıradaki adımını başlatan tek ve belirgin bir "Devam et" düğmesi bulunmalıdır. (MUST)

#### Scenario: Uygulama ilk kez açılır

- **WHEN** kullanıcı uygulamayı açar
- **THEN** Bugün ekranı görünür ve içinde sıradaki adımı başlatan tek bir baskın düğme bulunur

#### Scenario: Yarım kalmış adım varsa

- **WHEN** kullanıcının dünden veya bugünden yarım kalmış bir adımı vardır ve uygulamayı açar
- **THEN** "Devam et" düğmesi o adımı kaldığı yerden açar

#### Scenario: Gün tamamlanmışsa

- **WHEN** kullanıcı bugünün tüm adımlarını bitirmiştir
- **THEN** Bugün ekranı günün bittiğini söyler ve yarının konusunu gösterir

### Requirement: Dört sekmeli alt menü her ana ekranda görünür

Sistem, dört sekmeli bir alt menü sunmalıdır: Bugün, Öğren, Sınav, Pratik. Menü, bu dört bölümün ana ekranlarında her zaman görünmeli ve hangi sekmede olunduğunu belli etmelidir. (MUST)

#### Scenario: Sekme değiştirme

- **WHEN** kullanıcı alt menüden bir sekmeye dokunur
- **THEN** o sekmenin ana ekranı açılır ve o sekme seçili görünür

#### Scenario: Alt menü içerik akışını kapatmaz

- **WHEN** kullanıcı bir sorunun veya sınavın içindedir
- **THEN** alt menü soru ekranının üzerine binmez ve kullanıcı yanlışlıkla sınav ortasında sekme değiştirmez

### Requirement: Mevcut modlar silinmez, Pratik sekmesinde toplanır

Sistem, bu değişiklikten önce erişilebilen her modu (kelime, oyunlar, edat/artikel/çoğul alıştırmaları, animasyonlu slaytlar, yazma, Düello) Pratik sekmesinden ya da ilgili başka sekmeden erişilebilir bırakmalıdır. Bir özellik, kullanıcının bulabileceği tek bir yerde bulunmalıdır. (MUST)

#### Scenario: Eski mod hâlâ bulunur

- **WHEN** kullanıcı değişiklikten önce ana ekrandan açtığı bir moda erişmek ister
- **THEN** o modu Pratik, Öğren veya Sınav sekmesinden birinde bulur

#### Scenario: Aynı özellik iki yerde görünmez

- **WHEN** kullanıcı dört sekmeyi gezer
- **THEN** Dinleme ve Yazma gibi bir özellik yalnız tek bir sekmede giriş olarak yer alır

### Requirement: iPhone ana ekran kipinde menü güvenli alana uyar

Sistem, iPhone'da ana ekrana eklenmiş uygulama olarak çalışırken alt menünün ekran çentiği veya ana ekran çubuğuyla çakışmamasını sağlamalıdır. (MUST)

#### Scenario: iPhone ana ekran kipi

- **WHEN** arkadaşı uygulamayı iPhone'da ana ekrandan açar
- **THEN** alt menü düğmeleri tamamen görünür ve sistem çubuğuyla örtüşmez

### Requirement: Her ekranda geri dönüş ve konum belli olur

Sistem, alt menünün dışında açılan her alt ekranda kullanıcının hangi konuya veya güne ait olduğunu göstermeli ve geri dönüşü sağlamalıdır. (MUST)

#### Scenario: Konu içinden geri dönüş

- **WHEN** kullanıcı bir konunun içinde geri düğmesine basar
- **THEN** konunun bağlı olduğu sekmenin ana ekranına döner
