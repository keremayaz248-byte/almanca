## Purpose

Bir aylık çalışma programının her gününün, o gün çalışılacak konulara bağlanmasını ve kullanıcının dün ne çalıştığını, bugün ne çalışacağını, yarın ne geleceğini görebilmesini tanımlar. Amaç, takvimin okunacaklar listesi olmaktan çıkıp o gün gerçekten yapılabilir bir derse dönüşmesidir.

## ADDED Requirements

### Requirement: Her gün en az bir konuya bağlıdır

Sistem, programdaki her gün için o gün çalışılacak en az bir konuyu belirtmeli ve kullanıcının o konuya doğrudan geçmesini sağlamalıdır. Hiçbir gün, kullanıcıya yalnız bir kaynak adı ve sayfa numarası gösterip uygulama içinde yapılacak hiçbir şey bırakmamalıdır. (MUST)

#### Scenario: Herhangi bir gün açılır

- **WHEN** kullanıcı programdaki herhangi bir günü açar
- **THEN** o gün çalışılacak konular listelenir ve her birine geçiş yapılabilir

#### Scenario: Programın ilk günü

- **WHEN** kullanıcı programın ilk gününü açar
- **THEN** o gün için çalışılabilir bir konu sunulur

### Requirement: Kullanıcı dünü, bugünü ve yarını görür

Sistem, ana ekranda bugünün çalışmasını belirgin biçimde göstermeli, bir önceki gün ne çalışıldığını ve sonraki günlerde ne geleceğini de sunmalıdır. (MUST)

#### Scenario: Bugünün çalışması

- **WHEN** kullanıcı ana ekranı açar
- **THEN** bugün çalışılacak konular ve bugünün programdaki kaçıncı gün olduğu görünür

#### Scenario: Dün ne çalışıldı

- **WHEN** kullanıcı ana ekranı açar
- **THEN** bir önceki gün çalışılması planlanan konular ve tamamlanıp tamamlanmadığı görünür

#### Scenario: Sırada ne var

- **WHEN** kullanıcı ana ekranı açar
- **THEN** sonraki günlerde çalışılacak konulardan en az biri önceden görünür

### Requirement: Gün tek bir akış olarak baştan sona yürür

Sistem, günün çalışmasını tek bir başlatma ile baştan sona yürütmelidir. Kullanıcı o günün adımlarını tek tek seçmek veya her adım için ana ekrana dönüp yeni bir şeye tıklamak zorunda kalmamalıdır; bir adım bitince sıradaki adım kendiliğinden gelmelidir. (MUST)

#### Scenario: Gün başlatılır

- **WHEN** kullanıcı günün çalışmasını başlatır
- **THEN** günün ilk adımı açılır ve kullanıcı adım seçmek zorunda kalmaz

#### Scenario: Adım bitince sıradaki gelir

- **WHEN** kullanıcı günün bir adımını bitirir ve o günün başka adımı kalmıştır
- **THEN** sıradaki adım kendiliğinden başlar

#### Scenario: Akışın neresinde olduğu görünür

- **WHEN** kullanıcı günün çalışmasını yapmaktadır
- **THEN** kaç adımdan kaçıncısında olduğu görünür

### Requirement: Günün tamamlandığı yalnız tüm adımlar bitince bildirilir

Sistem, günün tamamlandığını ancak o güne bağlı tüm adımlar bitirildikten sonra bildirmelidir. Tamamlanma kullanıcının elle işaretlemesiyle değil, adımların bitmesiyle oluşmalıdır; kullanıcıdan "tamamladım" onayı istenmemelidir. (MUST)

#### Scenario: Tüm adımlar biter

- **WHEN** kullanıcı o güne bağlı son adımı da bitirir
- **THEN** sistem günün tamamlandığını kendiliğinden bildirir ve günü takvimde tamamlanmış olarak işaretler

#### Scenario: Adımlar yarım kaldığında bildirim gelmez

- **WHEN** kullanıcı o günün adımlarından bazılarını bitirmiş ama hepsini bitirmemiştir
- **THEN** sistem günün tamamlandığını bildirmez ve günü tamamlanmış olarak işaretlemez

#### Scenario: Elle tamamlama yoktur

- **WHEN** kullanıcı günün çalışmasını yapmaktadır
- **THEN** günü elle tamamlanmış işaretleyen bir seçenek sunulmaz

#### Scenario: Eksik kalan gün

- **WHEN** bir günün konuları tamamlanmadan sonraki güne geçilir
- **THEN** o gün eksik olarak işaretlenir ve kullanıcı geri dönüp tamamlayabilir

### Requirement: Program sınavın üç bölümünü de çalıştırır

Sistem, program boyunca dinleme, okuma ve yazma becerilerinin her birini ayrı ayrı çalıştıran günler içermeli ve bir günün hangi becerileri çalıştırdığını göstermelidir. (MUST)

#### Scenario: Beceri etiketleri görünür

- **WHEN** kullanıcı bir günü açar
- **THEN** o günün hangi becerileri çalıştırdığı etiketlerle gösterilir

#### Scenario: Üç beceri de programda yer alır

- **WHEN** program baştan sona incelenir
- **THEN** dinleme, okuma ve yazma becerilerinin her biri en az bir günde çalıştırılmış olur

### Requirement: Tüm konular programa dağıtılır

Sistem, uygulamadaki konuların tamamını program boyunca en az bir kez kullanıcının karşısına çıkarmalıdır. Yalnız kullanıcı kendi bulursa erişebileceği, programın dışında kalan konu bulunmamalıdır. (MUST)

#### Scenario: Konu kapsaması

- **WHEN** program baştan sona takip edilir
- **THEN** uygulamadaki her konu en az bir günde çalışılmış olur

### Requirement: Bağlantısı bozuk gün maddesi bulunmaz

Sistem, programdaki hiçbir bağlantının var olmayan bir konuya veya çalışmayan bir eyleme işaret etmemesini sağlamalıdır. (MUST)

#### Scenario: Gün bağlantısına tıklanır

- **WHEN** kullanıcı bir gündeki konu bağlantısına basar
- **THEN** hedeflenen konu açılır ve hata oluşmaz
