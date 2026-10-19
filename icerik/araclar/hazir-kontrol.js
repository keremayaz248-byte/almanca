// icerik/hazir/*.json ara dosyalarinin bicimini denetler (her madde kaynak etiketi tasimali).
// Kullanim: node icerik/araclar/hazir-kontrol.js
// Bicim:  { "konu": 14, "baslik": "...", "maddeler": [ { "tur": "kural|ornek|soru|kelime|ipucu",
//           "tr": "...", "de": "...", "kaynak": { "arac": "PDF|NotebookLM|Perplexity", "sayfa": "t1 s.50" } } ] }
// Cikis kodu: hata varsa 1.
const fs = require('fs');
const path = require('path');

const klasor = path.resolve(__dirname, '..', 'hazir');
const TURLER = ['kural', 'ornek', 'soru', 'kelime', 'ipucu', 'anlatim'];
const ARACLAR = ['PDF', 'NotebookLM', 'Perplexity'];
const hatalar = [];

function hata(dosya, i, msg) { hatalar.push(path.basename(dosya) + (i != null ? ' [madde ' + i + ']' : '') + ': ' + msg); }

function denetle(dosya, veri) {
  if (typeof veri.konu !== 'number') hata(dosya, null, '"konu" sayi olmali');
  if (!veri.baslik) hata(dosya, null, '"baslik" eksik');
  if (!Array.isArray(veri.maddeler) || !veri.maddeler.length) { hata(dosya, null, '"maddeler" bos veya dizi degil'); return; }
  veri.maddeler.forEach((m, i) => {
    if (!TURLER.includes(m.tur)) hata(dosya, i, 'gecersiz tur: ' + m.tur);
    if (!m.tr && !m.de) hata(dosya, i, 'tr veya de gerekli');
    if (!m.kaynak || !ARACLAR.includes(m.kaynak.arac)) hata(dosya, i, 'kaynak.arac gecersiz/eksik (PDF|NotebookLM|Perplexity)');
    else if (!m.kaynak.sayfa) hata(dosya, i, 'kaynak.sayfa eksik');
  });
}

if (!fs.existsSync(klasor)) { console.log('icerik/hazir/ yok; denetlenecek dosya yok.'); process.exit(0); }
const dosyalar = fs.readdirSync(klasor).filter(f => f.endsWith('.json'));
dosyalar.forEach(f => {
  const yol = path.join(klasor, f);
  try { denetle(yol, JSON.parse(fs.readFileSync(yol, 'utf8'))); }
  catch (e) { hata(yol, null, 'JSON okunamadi: ' + e.message); }
});
console.log('Denetlenen dosya:', dosyalar.length, '| Hata:', hatalar.length);
hatalar.forEach(h => console.log('  !!', h));
process.exit(hatalar.length ? 1 : 0);
