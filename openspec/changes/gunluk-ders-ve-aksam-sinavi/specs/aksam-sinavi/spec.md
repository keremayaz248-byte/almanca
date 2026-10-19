## Purpose

Her akşam 20:00'de, o güne kadar işlenen konulardan oluşan bir sınavı kullanıcıya yaptırır. Statik bir site telefona kendi başına bildirim zorlayamayacağı için, hatırlatma Google Calendar (ve isteğe bağlı e-posta) ile, kapı ise uygulama açıldığında uygulama içinde sağlanır.

## ADDED Requirements

### Requirement: Akşam sınavı o güne kadar işlenenlerden oluşur

Sistem, akşam sınavını o günün konusundan, önceki günlerin konularından ve kullanıcının daha önce yanlış yaptığı maddelerden oluşturmalıdır. Zayıf kalan madde daha sık sorulmalıdır. (MUST)

#### Scenario: Bugünün konusu sınavda yer alır

- **WHEN** kullanıcı akşam sınavını başlatır
- **THEN** sorular arasında o gün işlenen konudan sorular bulunur

#### Scenario: Zayıf madde geri gelir

- **WHEN** kullanıcı önceki bir sınavda veya egzersizde bir maddeyi yanlış yapmıştır
- **THEN** o madde akşam sınavında yeniden sorulabilir ve doğru bilinene kadar daha sık görünür

### Requirement: Sınav soruları resmî A1 sınav biçiminde, özgün yazılır

Sistem, akşam sınavı sorularını Goethe-Zertifikat A1 / telc / ÖSD A1 sınavlarının yapısına uygun (kısa diyalog ve anons dinleme, kısa metin okuma, form doldurma ve kısa mesaj yazma) ancak özgün metinlerle sunmalıdır. Resmî model sınavların metinleri, ses kayıtları, çözümleri tekrar yayınlanmamalıdır. (MUST)

#### Scenario: Sınav biçimi

- **WHEN** kullanıcı akşam sınavına başlar
- **THEN** sorular, o günün seviyesine uygun A1 sınav görevleri gibi (çoktan seçmeli diyalog, doğru/yanlış anons, kısa okuma, form veya mesaj yazma) sunulur

#### Scenario: Resmî metin yok

- **WHEN** yayındaki sınav soruları incelenir
- **THEN** hiçbir soru resmî bir model sınavın metninden birebir alınmamıştır

#### Scenario: Resmî sınava bağlantı

- **WHEN** kullanıcı gerçek model sınavları görmek ister
- **THEN** uygulama resmî sağlayıcıların ücretsiz model sınav sayfalarına bağlantı verir (metni kopyalamadan)

### Requirement: 20:00'den sonra açılışta önce sınav çıkar

Sistem, günün akşam sınavı henüz yapılmamışsa ve saat 20:00'yi geçmişse, uygulama açıldığında önce sınavı önermelidir. Kullanıcı sınavı bir kez ertelemek isterse, ertelemeye izin verilmelidir; aynı akşamın ikinci açılışında sınav tekrar önerilmeli ve ertelenememelidir. (MUST)

#### Scenario: Sınav yapılmamış, saat 20:00'den sonra

- **WHEN** kullanıcı saat 20:00'den sonra uygulamayı açar ve günün sınavı yapılmamıştır
- **THEN** Bugün ekranı yerine sınav ekranı görünür ve "Ertele" seçeneği sunulur

#### Scenario: Bir kez erteleme

- **WHEN** kullanıcı sınavı ertelemek ister
- **THEN** uygulama normal şekilde açılır; aynı akşamın bir sonraki açılışında sınav yeniden önerilir ve bu sefer ertelenemez

#### Scenario: Sınav zaten yapılmış

- **WHEN** günün sınavı tamamlanmıştır
- **THEN** kullanıcı saat kaç olursa olsun uygulamayı doğrudan açar

### Requirement: Takvime ekle düğmesi kullanıcının kendi takvimine tekrarlayan olay kurar

Sistem, kullanıcının tek dokunuşla kendi Google Calendar'ında her gün 20:00'de (İstanbul saatiyle) tekrarlayan bir olay oluşturabileceği bir düğme sunmalıdır. Olayın başlığı ve açıklaması hazır doldurulmalıdır. Bu yol için başka kişinin e-postası gerekmemelidir. Sistem, kullanıcının Google hesabına kendi başına erişmemelidir. (MUST)

#### Scenario: Düğmeye basılır

- **WHEN** kullanıcı "Takvime ekle" düğmesine basar
- **THEN** Google Calendar'ın olay oluşturma sayfası, günlük tekrarlı 20:00 olayı hazır dolu olarak açılır

#### Scenario: Arkadaş kendi telefonunda ekler

- **WHEN** arkadaş da kendi telefonunda aynı düğmeye basıp kaydeder
- **THEN** olay arkadaşın kendi takviminde de günlük 20:00'de tekrarlar

### Requirement: İsteğe bağlı ortak davet ve e-posta kurulumu

Sistem, kullanıcıya isteğe bağlı olarak hazır doldurulmuş bir Google Apps Script betiği sunabilmelidir; betik, kullanıcının kendi Google hesabında çalıştırıldığında iki kişinin davetli olduğu günlük olayı ve günlük hatırlatma e-postasını kurar. İki tarafın e-postası yalnız her iki kullanıcı da açık onay verdiyse betiğe yazılmalıdır. (MUST)

#### Scenario: Betik hazır dolu gelir

- **WHEN** iki kullanıcı da uygulamaya giriş yapmış ve e-postasını paylaşmayı onaylamıştır
- **THEN** kurulum ekranı iki e-postanın yazılı olduğu betiği ve kopyalama düğmesini gösterir

#### Scenario: Onay yoksa e-posta paylaşılmaz

- **WHEN** kullanıcılardan biri e-postasını paylaşmayı onaylamamıştır
- **THEN** karşı tarafın e-postası betikte veya ekranda görünmez

### Requirement: Bildirimin zorlanamadığı kullanıcıya açıkça söylenir

Sistem, telefondaki açılır bildirimin her kullanıcının kendi takvim ayarına bağlı olduğunu ve uygulamanın bunu zorlayamayacağını, takvim düğmesinin yanında kısa bir notla söylemelidir. (MUST)

#### Scenario: Not görünür

- **WHEN** kullanıcı Takvime ekle bölümünü açar
- **THEN** bildirimin kendi takvim ayarından açılması gerektiğini söyleyen not görünür
