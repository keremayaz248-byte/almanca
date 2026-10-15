// PDF cikariminda bozulan bitisik harfleri (ligature) sozluk yardimiyla onarir.
// Kullanim: node onar.js <ham_klasoru> <cikti_klasoru>
const fs = require('fs');
const path = require('path');

const hamDir = process.argv[2];
const outDir = process.argv[3];
const DOSYALAR = ['teil1', 'teil2', 'kalan', 'a2'];

// Bir harfin yerine denenecek acilimlar (gozlemlenen ligature'ler)
const ACILIM = ['ti', 'tt', 'ft', 'tı', 'fı', 'fi', 'fl', 'ff', 'ffi', 'lt',
                'tti', 'rt', 'tf', 'st', 'ck', 'ch', 'tü', 'tö', 'ti̇'];

const BUYUK = 'A-ZÄÖÜÇĞİÖŞÜ';
const KUCUK = 'a-zäöüßçğıöşüâîû';
const HARF = BUYUK + KUCUK;
const reHarf = new RegExp('^[' + HARF + ']+$');
const reSadeceBuyuk = new RegExp('^[' + BUYUK + '0-9]+$');

// Metni parcalara ayirirken korunacak "kelime govdesi" deseni:
// harfler + ligature yerine gecebilecek simgeler
const reParca = new RegExp('[' + HARF + '0-9*\\]\\[>=?^;:{}~|]+', 'g');

function icBuyukVar(s) {
  const govde = s.slice(1);
  return new RegExp('[' + BUYUK + ']').test(govde);
}
function simgeVar(s) {
  return new RegExp('[^' + HARF + ']').test(s);
}
function supheli(s) {
  if (s.length < 3) return false;
  if (reSadeceBuyuk.test(s)) return false;        // ARTIKEL gibi tam buyuk basliklar
  if (simgeVar(s)) return true;                    // icinde harf olmayan sey var
  if (!reHarf.test(s)) return true;
  return icBuyukVar(s);                            // isTyorum, MuTer gibi
}

// ---- 1. asama: temiz kelimelerden sozluk kur ----
const sayac = new Map();
const hamMetin = {};
for (const ad of DOSYALAR) {
  const p = path.join(hamDir, ad + '.txt');
  if (!fs.existsSync(p)) continue;
  const m = fs.readFileSync(p, 'utf8');
  hamMetin[ad] = m;
  for (const k of (m.match(reParca) || [])) {
    if (!reHarf.test(k)) continue;
    if (k.length < 3) continue;
    if (icBuyukVar(k) && !reSadeceBuyuk.test(k)) continue;
    const alt = k.toLowerCase();
    sayac.set(alt, (sayac.get(alt) || 0) + 1);
  }
}
console.log('Sozluk: ' + sayac.size + ' farkli temiz kelime');

// ---- 2. asama: onarim ----
const cache = new Map();
let denendi = 0, basarili = 0;
const basarisiz = new Map();
const ornekler = [];

// Onarilan kelimelerden "hangi simge hangi acilimi temsil ediyor" ogrenilir.
const ogrenilen = new Map();   // simge -> Map(acilim -> kac kez)
function ogren(simge, acilim) {
  if (!ogrenilen.has(simge)) ogrenilen.set(simge, new Map());
  const m = ogrenilen.get(simge);
  m.set(acilim, (m.get(acilim) || 0) + 1);
}
function ogrenilenAcilim(simge) {
  const m = ogrenilen.get(simge);
  if (!m) return null;
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function adayBul(k, esik) {
  const adaylar = [];
  for (let i = 0; i < k.length; i++) {
    for (const a of ACILIM) {
      const aday = k.slice(0, i) + a + k.slice(i + 1);
      const n = sayac.get(aday.toLowerCase()) || 0;
      if (n >= esik) adaylar.push({ aday, n, simge: k[i], acilim: a });
    }
  }
  adaylar.sort((x, y) => y.n - x.n);
  return adaylar[0] || null;
}

// Sozlukte karsiligi bulunamayan kelimeler icin: ogrenilen simge tablosunu uygula
function tabloylaOnar(k) {
  // E-posta, URL ve sayi iceren belirteclere DOKUNMA: "anna.becker27@" icindeki
  // 7 gercek rakamdir, bitisik harf degil.
  if (/[@\/]/.test(k)) return null;
  if ((k.match(/[0-9]/g) || []).length >= 2) return null;

  const harfRe = new RegExp('[' + HARF + ']');
  const kucukRe = new RegExp('[' + KUCUK + ']');
  const buyukRe = new RegExp('[' + BUYUK + ']');
  let out = '';
  let degisti = false;
  for (let i = 0; i < k.length; i++) {
    const ch = k[i];
    // Kelime ICINDE, iki yani kucuk harf olan BUYUK harf: bitisik harf olabilir
    // (isQyoruz -> istiyoruz). Ilk harf ve "BlackBerry" gibi birlesikler korunur.
    if (buyukRe.test(ch) && i > 0 && kucukRe.test(k[i - 1] || '') && kucukRe.test(k[i + 1] || '')) {
      const m = ogrenilen.get(ch);
      const en = m && [...m.entries()].sort((a, b) => b[1] - a[1])[0];
      if (en && en[1] >= 2) { out += en[0]; degisti = true; continue; }
      out += ch; continue;
    }
    if (harfRe.test(ch)) { out += ch; continue; }
    // Bitisik harf DAIMA kelime icindedir: iki yani da kucuk harf olmali.
    // Boylece satir basindaki madde isareti ("=Warum") ligature sanilmaz.
    const sol = k[i - 1], sag = k[i + 1];
    if (!(sol && kucukRe.test(sol) && sag && kucukRe.test(sag))) { out += ch; continue; }
    const a = ogrenilenAcilim(ch);
    if (a) { out += a; degisti = true; } else { out += ch; }
  }
  return degisti ? out : null;
}

function onar(k) {
  if (cache.has(k)) return cache.get(k);
  denendi++;
  const v = adayBul(k, 1);
  let sonuc = k;
  if (v) {
    sonuc = v.aday;
    basarili++;
    // Hem simgeleri (7, *, ]) hem de kelime ICINDE gecen buyuk harfleri ogren (T, Q, F).
    ogren(v.simge, v.acilim);
    if (ornekler.length < 40) ornekler.push(k + ' -> ' + v.aday + ' (' + v.n + ')');
  } else {
    basarisiz.set(k, (basarisiz.get(k) || 0) + 1);
  }
  cache.set(k, sonuc);
  return sonuc;
}

// Tamamen kucuk harfli ama sozlukte olmayan kelimeler (kauo -> kauft gibi):
// daha yuksek esikle, temkinli onarim
const cache2 = new Map();
let gizli = 0;
function onarGizli(k) {
  if (cache2.has(k)) return cache2.get(k);
  let sonuc = k;
  if (k.length >= 4 && !sayac.has(k.toLowerCase())) {
    const v = adayBul(k, 3);
    if (v) { sonuc = v.aday; gizli++; if (ornekler.length < 60) ornekler.push('[gizli] ' + k + ' -> ' + v.aday + ' (' + v.n + ')'); }
  }
  cache2.set(k, sonuc);
  return sonuc;
}

// ---- Ogrenme gecisi: once tum dosyalari tara, simge tablosunu olustur ----
for (const ad of DOSYALAR) {
  if (!hamMetin[ad]) continue;
  for (const tam of (hamMetin[ad].match(reParca) || [])) {
    if (tam === 'SAYFA') continue;
    const m = tam.match(/^(.*?)([?:;]+)$/);
    const k = m ? m[1] : tam;
    if (k.length && supheli(k)) onar(k);
  }
}
console.log('Ogrenilen simge tablosu:');
for (const [s, m] of ogrenilen) {
  const en = [...m.entries()].sort((a, b) => b[1] - a[1]);
  console.log('  "' + s + '" -> "' + en[0][0] + '"  ' + JSON.stringify(Object.fromEntries(en)));
}

let tabloOnarim = 0;
fs.mkdirSync(outDir, { recursive: true });
for (const ad of DOSYALAR) {
  if (!hamMetin[ad]) continue;
  const satirlar = hamMetin[ad].split('\n');
  const temiz = satirlar.map((satir) => {
    if (/^===== SAYFA \d+ =====$/.test(satir)) return satir;   // isaretci satiri: dokunma
    return satir.replace(reParca, (tam) => {
    if (tam === 'SAYFA') return tam;
    // Kelime sonundaki ? : ; gercek noktalamadir ("mi?", "er:") - ayir, dokunma.
    const m = tam.match(/^(.*?)([?:;]+)$/);
    const k = m ? m[1] : tam;
    const kuyruk = m ? m[2] : '';
    if (k.length === 0) return tam;
    if (supheli(k)) {
      const d = onar(k);
      if (d !== k) return d + kuyruk;
      const t = tabloylaOnar(k);          // sozluk bulamadi: ogrenilen tabloyu dene
      if (t) { tabloOnarim++; return t + kuyruk; }
      return k + kuyruk;
    }
    if (reHarf.test(k) && k === k.toLowerCase()) return onarGizli(k) + kuyruk;
    return tam;
    });
  }).join('\n');
  fs.writeFileSync(path.join(outDir, ad + '.txt'), temiz, 'utf8');
  console.log('yazildi: ' + ad + '.txt');
}

console.log('\nSupheli kelime turu: ' + denendi + ' | onarilan: ' + basarili +
            ' | onarilamayan: ' + (denendi - basarili) + ' | gizli onarim: ' + gizli);
console.log('\nOrnek onarimlar:');
for (const o of ornekler.slice(0, 40)) console.log('  ' + o);
const kalanlar = [...basarisiz.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log('\nOnarilamayanlardan ornekler:');
for (const [k, n] of kalanlar) console.log('  ' + k);
