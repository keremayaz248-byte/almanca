// icerik/hazir/*.json ara dosyalarinin bicimini denetler. Kalite kapisi: yayinlanmadan once gecmeli.
// Kullanim: node icerik/araclar/hazir-kontrol.js [dosya.json ...]   (bos birakilirsa klasordeki tum dosyalar)
// Cikis kodu: hata varsa 1.
//
// IKI BICIM:
//  1) Ders dosyasi  konu-<no>.json   -> { konu, baslik, kaynak:[{arac,sayfa}], deste:{...}, gramer:{...}, dogrulama:[] }
//  2) Madde dosyasi (eski, _ornek.json) -> { konu, baslik, maddeler:[{tur,tr,de,kaynak:{arac,sayfa}}] }
// Dosya adi "_" ile basliyorsa yalnizca bicim ornegidir; yerlestirilmez.
const fs = require('fs');
const path = require('path');

const klasor = path.resolve(__dirname, '..', 'hazir');
const kok = path.resolve(__dirname, '..', '..');
const TURLER = ['kural', 'ornek', 'soru', 'kelime', 'ipucu', 'anlatim'];
const ARACLAR = ['PDF', 'NotebookLM', 'Perplexity'];
const ROLLER = ['ozne', 'fiil', 'bag', 'nesne', 'zaman', 'diger'];
const SAYFA_TURLERI = ['sema', 'tablo', 'zaman', 'kural'];
const YASAK_HTML = /<\s*(script|iframe|object|embed|link|style)\b|on\w+\s*=|javascript:/i;
const hatalar = [];
const uyarilar = [];
const gramerIdleri = new Map();

function hata(dosya, yer, msg) { hatalar.push(path.basename(dosya) + (yer ? ' [' + yer + ']' : '') + ': ' + msg); }
function uyari(dosya, yer, msg) { uyarilar.push(path.basename(dosya) + (yer ? ' [' + yer + ']' : '') + ': ' + msg); }
const metin = x => typeof x === 'string' && x.trim().length > 0;

function kaynakDenetle(dosya, yer, kaynak) {
  if (!Array.isArray(kaynak) || !kaynak.length) { hata(dosya, yer, 'kaynak bos (en az bir {arac,sayfa})'); return; }
  kaynak.forEach((k, i) => {
    if (!k || !ARACLAR.includes(k.arac)) hata(dosya, yer + ' #' + (i + 1), 'kaynak.arac gecersiz (PDF|NotebookLM|Perplexity)');
    else if (!metin(k.sayfa)) hata(dosya, yer + ' #' + (i + 1), 'kaynak.sayfa eksik');
  });
}

function htmlDenetle(dosya, yer, s) {
  if (typeof s === 'string' && YASAK_HTML.test(s)) hata(dosya, yer, 'yasak HTML/olay: ' + s.slice(0, 60));
}

function slaytDenetle(dosya, i, s) {
  const yer = 'slayt ' + (i + 1);
  JSON.stringify(s, (k, v) => { htmlDenetle(dosya, yer, v); return v; });
  if (s.tur) {
    if (!SAYFA_TURLERI.includes(s.tur)) { hata(dosya, yer, 'bilinmeyen tur: ' + s.tur); return; }
    if (!metin(s.baslik)) hata(dosya, yer, 'baslik eksik');
    if (s.tur === 'sema') {
      if (!Array.isArray(s.satirlar) || !s.satirlar.length) hata(dosya, yer, 'sema: satirlar bos');
      else s.satirlar.forEach((r, j) => {
        if (!metin(r.etiket)) hata(dosya, yer, 'sema satir ' + (j + 1) + ': etiket eksik');
        if (!Array.isArray(r.jetonlar) || r.jetonlar.length < 2) hata(dosya, yer, 'sema satir ' + (j + 1) + ': en az 2 jeton');
        else r.jetonlar.forEach(t => { if (!metin(t.t) || !ROLLER.includes(t.r)) hata(dosya, yer, 'sema satir ' + (j + 1) + ': jeton gecersiz ' + JSON.stringify(t)); });
      });
    } else if (s.tur === 'tablo') {
      if (!Array.isArray(s.basliklar) || s.basliklar.length < 2) hata(dosya, yer, 'tablo: en az 2 baslik');
      else if (!Array.isArray(s.satirlar) || !s.satirlar.length) hata(dosya, yer, 'tablo: satir yok');
      else s.satirlar.forEach((r, j) => { if (!Array.isArray(r) || r.length !== s.basliklar.length) hata(dosya, yer, 'tablo satir ' + (j + 1) + ': sutun sayisi basliklarla ayni degil'); });
    } else if (s.tur === 'zaman') {
      if (!Array.isArray(s.noktalar) || s.noktalar.length < 2 || s.noktalar.some(n => !metin(n.baslik))) hata(dosya, yer, 'zaman: en az 2 nokta, her birinde baslik');
    } else if (s.tur === 'kural') {
      if (!Array.isArray(s.maddeler) || !s.maddeler.length) hata(dosya, yer, 'kural: madde yok');
    }
    if (!metin(s.kaynak)) hata(dosya, yer, 'her sayfa "kaynak" tasimali (ör. "Teil-1 s.62")');
    return;
  }
  if (s.type === 'intro' || s.type === 'outro') {
    if (!metin(s.big) || !(metin(s.mean) || metin(s.story))) hata(dosya, yer, s.type + ': big ve (mean|story) gerekli');
    return;
  }
  if (!metin(s.big) || !metin(s.mean)) hata(dosya, yer, 'kelime/kavram sayfasi: big ve mean gerekli');
  if (!(Array.isArray(s.egs) && s.egs.length) && !metin(s.tip)) hata(dosya, yer, 'kelime/kavram sayfasi: egs veya tip gerekli');
  if (!metin(s.kaynak)) hata(dosya, yer, 'her sayfa "kaynak" tasimali (ör. "Teil-1 s.62")');
}

function gramerDenetle(dosya, g, konuNo) {
  if (!g) { hata(dosya, 'gramer', 'gramer bolumu eksik'); return; }
  if (!/^[a-z0-9_]+$/.test(g.id || '')) hata(dosya, 'gramer', 'id kucuk harf/rakam/_ olmali');
  else if (gramerIdleri.has(g.id)) hata(dosya, 'gramer', 'id baska dosyada da var: ' + g.id + ' (' + gramerIdleri.get(g.id) + ')');
  else gramerIdleri.set(g.id, path.basename(dosya));
  ['title', 'emoji', 'desc', 'rule'].forEach(a => { if (!metin(g[a])) hata(dosya, 'gramer', a + ' eksik'); });
  htmlDenetle(dosya, 'gramer.rule', g.rule);
  if (!Array.isArray(g.qs) || g.qs.length < 8) { hata(dosya, 'gramer', 'en az 8 soru gerekli (' + (g.qs ? g.qs.length : 0) + ' var)'); return; }
  g.qs.forEach((q, i) => {
    const yer = 'soru ' + (i + 1);
    if (!metin(q.sent) || (q.sent.match(/___/g) || []).length !== 1) hata(dosya, yer, 'sent tam bir "___" icermeli');
    if (!Array.isArray(q.opts) || q.opts.length < 3 || q.opts.length > 4 || new Set(q.opts).size !== q.opts.length) hata(dosya, yer, 'opts 3-4 benzersiz secenek olmali');
    else if (!q.opts.includes(q.blank)) hata(dosya, yer, 'blank secenekler arasinda degil: ' + q.blank);
    if (!metin(q.tr)) hata(dosya, yer, 'tr (Turkce ceviri) eksik');
    if (!metin(q.exp) || q.exp.length < 20) hata(dosya, yer, 'exp (aciklama) eksik veya cok kisa');
    htmlDenetle(dosya, yer, q.sent + ' ' + q.exp);
  });
  // ayni cevap hep ayni sirada olmasin: secenekler karistirilir ama cevap dagilimi bilgi icin
  const ayni = new Set(g.qs.map(q => q.blank)).size;
  if (ayni < Math.min(4, g.qs.length)) uyari(dosya, 'gramer', 'sorularin cevaplari cok tekduze (' + ayni + ' farkli cevap)');
}

// NotebookLM'den gelen mini test: {baslik, kaynak, sorular:[{prompt, answer, opts, exp, wrongExp?, hint?}]}
function miniDenetle(dosya, m) {
  if (!metin(m.kaynak) || !/NotebookLM/.test(m.kaynak)) hata(dosya, 'mini', 'kaynak "NotebookLM ..." ile baslamali');
  if (!Array.isArray(m.sorular) || m.sorular.length < 5) { hata(dosya, 'mini', 'en az 5 soru gerekli'); return; }
  m.sorular.forEach((q, i) => {
    const yer = 'mini ' + (i + 1);
    if (!metin(q.prompt)) hata(dosya, yer, 'prompt eksik');
    if (!Array.isArray(q.opts) || q.opts.length < 3 || q.opts.length > 5 || new Set(q.opts).size !== q.opts.length) hata(dosya, yer, 'opts 3-5 benzersiz secenek olmali');
    else if (!q.opts.includes(q.answer)) hata(dosya, yer, 'answer secenekler arasinda degil');
    if (!metin(q.exp) || q.exp.length < 20) hata(dosya, yer, 'exp eksik veya cok kisa');
    if (q.wrongExp) Object.keys(q.wrongExp).forEach(k2 => { if (!(q.opts || []).includes(k2)) hata(dosya, yer, 'wrongExp anahtari secenek degil: ' + k2); });
    htmlDenetle(dosya, yer, [q.prompt, q.exp, JSON.stringify(q.wrongExp || {})].join(' '));
  });
}

function dersDenetle(dosya, v, konular) {
  if (typeof v.konu !== 'number' || !konular.has(v.konu)) hata(dosya, null, '"konu" KONULAR icinde yok: ' + v.konu);
  if (!metin(v.baslik)) hata(dosya, null, '"baslik" eksik');
  kaynakDenetle(dosya, 'kaynak', v.kaynak);
  const d = v.deste;
  if (!d || !metin(d.title) || !metin(d.accent)) { hata(dosya, 'deste', 'title ve accent gerekli'); }
  else if (!Array.isArray(d.slides) || d.slides.length < 6 || d.slides.length > 16) hata(dosya, 'deste', 'slides 6-16 sayfa olmali (' + (d.slides ? d.slides.length : 0) + ' var)');
  else {
    d.slides.forEach((s, i) => slaytDenetle(dosya, i, s));
    if (!d.slides.some(s => SAYFA_TURLERI.includes(s.tur))) hata(dosya, 'deste', 'en az bir gorsel sayfa (sema/tablo/zaman/kural) gerekli');
    if (!d.slides.some(s => s.type === 'intro')) uyari(dosya, 'deste', 'intro sayfasi yok');
    if (!d.slides.some(s => s.type === 'outro')) uyari(dosya, 'deste', 'outro (ezber/ozet) sayfasi yok');
  }
  gramerDenetle(dosya, v.gramer, v.konu);
  if (v.mini) miniDenetle(dosya, v.mini);
  if (v.dogrulama && !Array.isArray(v.dogrulama)) hata(dosya, null, '"dogrulama" dizi olmali');
  if (Array.isArray(v.dogrulama) && v.dogrulama.length) uyari(dosya, null, v.dogrulama.length + ' madde Perplexity dogrulamasi bekliyor');
}

function maddeDenetle(dosya, veri) {
  if (typeof veri.konu !== 'number') hata(dosya, null, '"konu" sayi olmali');
  if (!veri.baslik) hata(dosya, null, '"baslik" eksik');
  if (!Array.isArray(veri.maddeler) || !veri.maddeler.length) { hata(dosya, null, '"maddeler" bos veya dizi degil'); return; }
  veri.maddeler.forEach((m, i) => {
    if (!TURLER.includes(m.tur)) hata(dosya, 'madde ' + i, 'gecersiz tur: ' + m.tur);
    if (!m.tr && !m.de) hata(dosya, 'madde ' + i, 'tr veya de gerekli');
    if (!m.kaynak || !ARACLAR.includes(m.kaynak.arac)) hata(dosya, 'madde ' + i, 'kaynak.arac gecersiz/eksik (PDF|NotebookLM|Perplexity)');
    else if (!m.kaynak.sayfa) hata(dosya, 'madde ' + i, 'kaynak.sayfa eksik');
  });
}

function konuNumaralari() {
  const h = fs.readFileSync(path.join(kok, 'index.html'), 'utf8');
  const i = h.indexOf('const KONULAR=['), j = h.indexOf('\n];', i);
  return new Set([...h.slice(i, j).matchAll(/\{no:(\d+),/g)].map(m => +m[1]));
}

if (!fs.existsSync(klasor)) { console.log('icerik/hazir/ yok; denetlenecek dosya yok.'); process.exit(0); }
const konular = konuNumaralari();
const argDosyalar = process.argv.slice(2).map(f => path.resolve(f));
const dosyalar = (argDosyalar.length ? argDosyalar : fs.readdirSync(klasor).filter(f => f.endsWith('.json')).map(f => path.join(klasor, f)));
dosyalar.forEach(yol => {
  try {
    const veri = JSON.parse(fs.readFileSync(yol, 'utf8'));
    if (veri.deste || veri.gramer) dersDenetle(yol, veri, konular); else maddeDenetle(yol, veri);
  } catch (e) { hata(yol, null, 'JSON okunamadi: ' + e.message); }
});
console.log('Denetlenen dosya:', dosyalar.length, '| Hata:', hatalar.length, '| Uyari:', uyarilar.length);
hatalar.forEach(h => console.log('  !!', h));
uyarilar.forEach(u => console.log('  ..', u));
process.exit(hatalar.length ? 1 : 0);
