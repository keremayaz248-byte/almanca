## Purpose

Her konunun, kullanıcı alıştırmaya başlamadan önce okuyabileceği bir anlatımının bulunmasını sağlar. Anlatım hocanın kendi ders materyalinden gelir; uydurulmuş veya kaynaktan kopuk bir açıklama değildir. Amaç, kullanıcının "bu konu nedir" sorusunu uygulamadan çıkmadan cevaplayabilmesidir.

## ADDED Requirements

### Requirement: Her konunun anlatımı bulunur

Sistem, programdaki her konu için uygulama içinde okunabilir bir anlatım sunmalıdır. Hiçbir konu, kullanıcıya yalnız bir kaynak adı ve sayfa numarası gösterip uygulama içinde açıklama bırakmamalıdır. (MUST)

#### Scenario: Konu açılır

- **WHEN** kullanıcı herhangi bir konuyu açar
- **THEN** o konunun kuralını, örneklerini ve dikkat edilecek noktalarını içeren bir anlatım gösterilir

#### Scenario: Dış kaynağa yönlendirme yapılmaz

- **WHEN** kullanıcı bir konunun anlatımını açar
- **THEN** sistem kullanıcıyı uygulama dışındaki bir dosyaya yönlendirmez

### Requirement: Anlatım hocanın materyaline sadık kalır

Sistem, konu anlatımlarını hocanın ders materyalindeki kural, örnek ve vurgulara dayandırmalıdır. Materyalde bulunmayan bir kural, kaynaktakiyle çelişecek biçimde sunulmamalıdır. (MUST)

#### Scenario: Kaynakta geçen kural korunur

- **WHEN** hocanın materyalinde bir konuya özel bir kural veya istisna vurgulanmıştır
- **THEN** o kural uygulamadaki anlatımda da yer alır

#### Scenario: Kaynakta olmayan içerik ayırt edilir

- **WHEN** anlatıma kaynakta bulunmayan tamamlayıcı bir açıklama eklenir
- **THEN** bu ek açıklama kaynaktaki kuralla çelişmez

### Requirement: Anlatım örnek ve karşılaştırma içerir

Sistem, her konu anlatımında en az bir Almanca örneği Türkçe karşılığıyla birlikte göstermelidir. Türkçeden farklı çalışan noktalar açıkça belirtilmelidir. (MUST)

#### Scenario: Örnek gösterimi

- **WHEN** kullanıcı bir konu anlatımını okur
- **THEN** kuralın nasıl uygulandığını gösteren en az bir Almanca örnek ve Türkçe karşılığı bulunur

#### Scenario: Sık yapılan hata uyarısı

- **WHEN** bir konuda Türkçe konuşanların tipik olarak hata yaptığı bir nokta vardır
- **THEN** anlatım bu noktayı ayrıca uyarı olarak belirtir

### Requirement: Anlatımdan doğrudan alıştırmaya geçilir

Sistem, kullanıcının konu anlatımını okuduktan sonra aynı ekrandan o konunun alıştırmasına geçmesini sağlamalıdır. Kullanıcı alıştırmayı bulmak için menüde arama yapmak zorunda kalmamalıdır. (MUST)

#### Scenario: Anlatımdan alıştırmaya geçiş

- **WHEN** kullanıcı bir konunun anlatımını okur
- **THEN** aynı ekranda o konunun alıştırmasına başlatan bir seçenek bulunur

### Requirement: Anlatım her iki temada okunabilir

Sistem, konu anlatımlarını hem açık hem koyu temada okunabilir kontrastla göstermelidir. (MUST)

#### Scenario: Koyu temada anlatım

- **WHEN** kullanıcı koyu temadayken bir konu anlatımını açar
- **THEN** anlatımdaki tüm metin, tablo ve vurgular okunabilir kontrastta görünür
