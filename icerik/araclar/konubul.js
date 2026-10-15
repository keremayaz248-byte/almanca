// Her konunun hangi sayfada basladigini bulur.
// Kullanim: node konubul.js <temiz_klasoru>
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];

const KONULAR = {
  teil1: [
    [1, 'Das Alphabet', /Alphabet/i],
    [2, 'Hallo! Hi!', /\bHallo\b/],
    [3, 'Wie geht es Ihnen?', /Wie geht es/i],
    [4, 'Wie heißen Sie?', /heiß(en|e)\b/i],
    [5, 'Tschüs! Bye!', /Tschüs/i],
    [6, 'Die Zahlen', /\bZahlen\b/],
    [7, 'Die E-Mail-Adresse', /E-Mail/i],
    [8, 'Wo wohnen Sie?', /wohn(en|e|st)\b/i],
    [9, 'Woher kommen Sie?', /Woher/i],
    [10, 'Die Länder / Die Sprachen', /\bLänder\b|\bSprachen\b/],
    [11, 'Ihre Information', /Information/i],
    [12, 'Die Farben', /\bFarben?\b/],
    [13, 'Die Kleidung', /Kleidung/i],
    [14, 'Die Verben + TMP', /\bTMP\b/],
    [15, 'Die Hobbys / Gern', /Hobby|Hobbys/i],
    [16, 'Das Wetter', /\bWetter\b/],
    [17, 'Gehen wir ins Kino?', /\bKino\b/],
    [18, 'Die Berufe', /\bBeruf(e)?\b/],
    [19, 'Die Artikel / Nominativ', /Nominativ/],
    [20, 'Die Artikel / Akkusativ', /Akkusativ/],
    [21, 'Präpositionen mit immer Akkusativ', /Präpositionen.{0,30}AKKUSATIV/i],
    [22, 'Die Plural-Formen', /\bPlural\b/],
    [23, 'Nicht oder Kein', /\bKein\b.{0,20}\bNicht\b|\bNicht\b.{0,20}\bKein\b/i],
    [24, 'W-Fragen', /W-Fragen/i],
    [25, 'Guten Appetit (Obst und Gemüse)', /Appetit|Obst und Gemüse/i],
  ],
  kalan: [
    [26, 'Modalverben (Präsens)', /MODALVERBEN/i],
    [27, 'Die trennbaren Verben', /aufmachen|trennbar/i],
    [28, 'Wie spät ist es? (Uhrzeit)', /Wie viel Uhr|Wie spät/i],
    [29, 'Präteritum – sein und haben', /Präteritum/],
    [30, 'Die Artikel / Dativ', /\bDativ\b/],
    [31, 'Präpositionen mit immer Dativ', /Präpositionen.{0,40}DATIV/i],
    [32, 'Die Artikel / Genitiv', /GENITIV/],
    [33, 'Meine Familie', /Meine Familie/i],
    [34, 'Demonstrativpronomen', /Demonstrativpronomen/i],
    [35, 'Imperative', /Imperativ/i],
    [36, 'Das Perfekt', /\bPerfekt\b/],
    [37, 'Zuerst / Dann / Danach', /Zuerst/i],
    [38, 'Einen Brief schreiben', /EIN BRIEF|\bBrief\b/i],
    [39, 'Wörter-1 (kelime listesi)', /Wörter-1/i],
    [40, 'Wörter-2 (kelime listesi)', /Wörter-2/i],
  ],
  a2: [
    [1, 'Präpositionen (genel tekrar)', /Präpositionen/],
    [2, 'Legen / Stellen / Liegen / Stehen / Hängen', /Legen|Stellen.{0,20}Liegen/i],
    [3, 'Wie komme ich ...?', /Wie komme ich/i],
    [4, 'Wörter-1', /Wörter-1/i],
    [5, 'Die Körperteile', /Körperteil/i],
    [6, 'Und / oder / aber / denn', /\bdenn\b.{0,30}\baber\b|Konjugationen von/i],
    [7, 'Possessivartikel', /Possessivartikel|Possessiv/i],
    [8, 'Reflexive Verben', /Reflexiv/i],
    [9, 'Doch / Noch', /\bDoch\b.{0,15}\bNoch\b/i],
    [10, 'Weil / da', /\bWeil\b/],
    [11, 'Deshalb / Sonst', /Deshalb/i],
    [12, 'Bis', /Konjugation von .Bis/i],
    [13, 'Die Küche', /Die Küche/i],
    [14, 'Schultypen / Die Fächer', /Schultypen|Fächer/i],
    [15, 'Medien im Alltag', /Medien im Alltag/i],
    [16, 'Wörter-2', /Wörter-2|Wirter-2/i],
    [17, 'Komparativ und Superlativ', /Komparativ|Komparation/i],
    [18, 'Adjektivdeklination', /Adjektive nach dem/i],
    [19, '...selbe / ...gleiche', /selbe/i],
    [20, 'Wenn / es sei denn / falls / als', /es sei denn/i],
    [21, 'Damit / um...zu', /\bDamit\b.{0,20}um/i],
    [22, 'Die n-Deklination', /n-Deklination/i],
    [23, 'Indirekte Fragen', /Indirekte Fragen/i],
    [24, 'Je nachdem ... ob', /Je nachdem/i],
    [25, 'Modalverben (Präteritum)', /Modalverben.{0,20}Präteritum|Präteritum.{0,20}Modalverb/i],
    [26, 'Werden', /\bWERDEN\b/],
    [27, 'Höflichkeitsform', /Höflichkeitsform/i],
    [28, 'Zusammengesetzte Wörter', /Zusammengesetzte/i],
  ],
};

for (const [dosya, liste] of Object.entries(KONULAR)) {
  const p = path.join(dir, dosya + '.txt');
  if (!fs.existsSync(p)) continue;
  const metin = fs.readFileSync(p, 'utf8');
  const sayfalar = [];
  let cur = null;
  for (const satir of metin.split('\n')) {
    const m = satir.match(/^===== SAYFA (\d+) =====$/);
    if (m) { cur = { no: +m[1], satirlar: [] }; sayfalar.push(cur); continue; }
    if (cur) cur.satirlar.push(satir);
  }
  console.log('\n######## ' + dosya.toUpperCase() + ' (' + sayfalar.length + ' sayfa) ########');
  for (const [no, ad, re] of liste) {
    const vurus = [];
    for (const s of sayfalar) {
      const bas = s.satirlar.slice(0, 3).join(' ');     // sayfa basligi bolgesi
      const tum = s.satirlar.join(' ');
      if (re.test(bas)) vurus.push({ p: s.no, agirlik: 2 });
      else if (re.test(tum)) vurus.push({ p: s.no, agirlik: 1 });
    }
    const basliktakiler = vurus.filter(v => v.agirlik === 2).map(v => v.p);
    const digerleri = vurus.filter(v => v.agirlik === 1).map(v => v.p);
    console.log(String(no).padStart(2) + ') ' + ad.padEnd(42) +
      ' baslikta: [' + basliktakiler.slice(0, 8).join(',') + ']' +
      '  icerikte: [' + digerleri.slice(0, 8).join(',') + ']' +
      (vurus.length ? '' : '  >>> BULUNAMADI'));
  }
}
