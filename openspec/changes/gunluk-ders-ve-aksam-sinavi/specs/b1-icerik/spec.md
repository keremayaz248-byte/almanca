## Purpose

Teil-2.pdf (B1 seviyesi) içeriğini uygulamaya konu konu getirir. Bugün Konjunktiv II, Plusquamperfekt ve Futur II uygulamada yok; Futur I yalnızca bir slayt olarak var. Her konu, hocanın materyaline bağlı kalarak anlatım ve egzersizle sunulmalıdır.

## ADDED Requirements

### Requirement: Teil-2 konuları uygulamada bulunur

Sistem, Teil-2.pdf'te işlenen şu konuların her biri için anlatım ve en az bir egzersiz sunmalıdır: Genitiv Präpositionen, Zweiteilige Konjunktionen, Konjunktiv II, Plusquamperfekt, Futur I, Futur II. (MUST)

#### Scenario: Konu listesinde görünür

- **WHEN** kullanıcı Öğren sekmesini açar
- **THEN** Teil-2 konuları listede yer alır ve her biri açılabilir

#### Scenario: Konunun anlatımı ve egzersizi vardır

- **WHEN** kullanıcı bir Teil-2 konusunu açar
- **THEN** anlatım sayfaları ve o konuya ait egzersiz bulunur

### Requirement: İçerik kaynağını gösterir

Sistem, her Teil-2 maddesinde (kural, örnek, soru) içeriğin nereden geldiğini kaynak etiketiyle göstermelidir: PDF sayfası, NotebookLM veya Perplexity. Kaynağı doğrulanamayan madde yayınlanmamalıdır. (MUST)

#### Scenario: Kaynak etiketi görünür

- **WHEN** kullanıcı bir kural kartını açar
- **THEN** kartın altında kaynağı (ör. "Teil-2 s. 113") görünür

#### Scenario: Okunamayan sayfa

- **WHEN** bir PDF sayfası okunamaz veya bozuk çıkar
- **THEN** o sayfadan kural uydurulmaz; madde atlanır ve eksik olarak not düşülür

### Requirement: Teil-2 konusu dayandığı A1 konusuna bağlanır

Sistem, bir Teil-2 konusunun dayandığı daha eski konuları (Modalverben, Präteritum sein/haben, Perfekt) konunun başında kısa bir hatırlatmayla ve ilgili tam üniteye giden bir bağlantıyla göstermelidir. Tam üniteler müfredatta Teil-2'den önce işlendiği için hatırlatma özet niteliğinde kalabilir. (MUST)

#### Scenario: Konjunktiv II hatırlatması

- **WHEN** kullanıcı Konjunktiv II konusunu açar
- **THEN** başta Präteritum (hatte, war) ve Modalverben'in kısa hatırlatması ve ilgili tam üniteye bağlantı görünür

#### Scenario: Ön koşul henüz işlenmemişse

- **WHEN** kullanıcı bir Teil-2 konusunu, dayandığı A1 konusunu tamamlamadan açar
- **THEN** uygulama o A1 konusunun henüz tamamlanmadığını söyler ve oraya gitmeyi önerir
