// Hocanin "Almancaya cevirin" diye verdigi Turkce paragraf ve diyaloglari,
// bir de kelime listelerini cikarir.
// Kullanim: node metinbul.js <temiz_klasoru> <cikti.json>
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const cikti = process.argv[3];
const DOSYALAR = { teil1: 'Teil-1.pdf', kalan: 'Kalan Üniteler.pdf', a2: 'A2 Dosyası.pdf' };

// --- dil tespiti ---
const TR_HARF = /[ıİşŞğĞ]/;
const TR_KELIME = /\b(ve|bir|bu|için|ama|çok|var|ile|değil|sonra|şimdi|benim|senin|onun|daha|gibi|kadar|olarak|yapıyorum|gidiyorum|seviyorum|istiyorum)\b/gi;
const DE_KELIME = /\b(der|die|das|ich|und|ist|ein|eine|nicht|sie|wir|haben|sein|mit|auf|für|von|zu|den|dem|aber|auch|werden|können)\b/gi;

function skor(s) {
  const tr = (s.match(TR_KELIME) || []).length + (TR_HARF.test(s) ? 2 : 0);
  const de = (s.match(DE_KELIME) || []).length;
  return { tr, de };
}
function turkceMi(s) {
  const { tr, de } = skor(s);
  return tr >= 3 && tr > de * 2;
}
// Ceviri alistirmasi: hocanin "Almancaya cevirin" diye verdigi SAF Turkce metin.
// Gramer anlatim sayfalari Almanca ornek cumlelerle dolu oldugu icin elenir.
function safTurkceMi(s) {
  const { tr, de } = skor(s);
  if (tr < 5 || de > 2) return false;
  // Almanca ornek cumle kaliplari: "* Ich ...", "(Ich ...)", "z.B."
  if (/\bIch\s+\w+|\bz\.B\.|\bder\s+\w+\s+ist\b/.test(s)) return false;
  return true;
}

// --- sayfalara ayir ---
function sayfalaraAyir(metin) {
  const sayfalar = [];
  let cur = null;
  for (const satir of metin.split('\n')) {
    const m = satir.match(/^===== SAYFA (\d+) =====$/);
    if (m) { cur = { no: +m[1], satirlar: [] }; sayfalar.push(cur); continue; }
    if (cur) cur.satirlar.push(satir);
  }
  return sayfalar;
}

const sonuc = { surum: 1, olusturma: new Date().toISOString().slice(0, 10), paragraflar: [], diyaloglar: [], kelimeListeleri: [] };

for (const [kod, dosyaAdi] of Object.entries(DOSYALAR)) {
  const p = path.join(dir, kod + '.txt');
  if (!fs.existsSync(p)) continue;
  for (const sayfa of sayfalaraAyir(fs.readFileSync(p, 'utf8'))) {
    const satirlar = sayfa.satirlar.map(s => s.trim());
    const tamMetin = satirlar.filter(Boolean).join(' ');
    if (tamMetin.length < 120) continue;

    // 1) DIYALOG: "A:" / "B:" ile baslayan satirlar
    const diyalogSatirlari = satirlar.filter(s => /^[A-ZB]\s*:/.test(s));
    if (diyalogSatirlari.length >= 4 && turkceMi(diyalogSatirlari.join(' '))) {
      sonuc.diyaloglar.push({
        kaynak: dosyaAdi, kod, sayfa: sayfa.no,
        satirSayisi: diyalogSatirlari.length,
        satirlar: diyalogSatirlari
      });
      continue;
    }

    // 2) KELIME LISTESI: "x (anlam), y (anlam), ..." kalibinin yogun oldugu sayfa
    const parantezli = (tamMetin.match(/\([^)]{2,40}\)/g) || []).length;
    const virgul = (tamMetin.match(/,/g) || []).length;
    if (parantezli >= 12 && virgul >= 12 && tamMetin.length > 400) {
      sonuc.kelimeListeleri.push({
        kaynak: dosyaAdi, kod, sayfa: sayfa.no,
        girdiSayisi: parantezli,
        metin: tamMetin.slice(0, 4000)
      });
      continue;
    }

    // 3) CEVIRI PARAGRAFI: uzun, Turkce, diyalog degil
    //    Satirlari ardisik Turkce bloklara topla
    let blok = [];
    const bloklar = [];
    for (const s of satirlar) {
      if (!s) { if (blok.length) { bloklar.push(blok); blok = []; } continue; }
      blok.push(s);
    }
    if (blok.length) bloklar.push(blok);

    for (const b of bloklar) {
      const t = b.join(' ').replace(/\s+/g, ' ').trim();
      if (t.length < 180) continue;
      if (!safTurkceMi(t)) continue;
      if (/^[A-ZB]\s*:/.test(b[0])) continue;
      sonuc.paragraflar.push({
        kaynak: dosyaAdi, kod, sayfa: sayfa.no,
        uzunluk: t.length,
        kelimeSayisi: t.split(/\s+/).length,
        metin: t
      });
    }
  }
}

// --- "X → Y = anlam" kalibindaki cogul/kelime esleri ---
sonuc.kelimeCiftleri = [];
for (const [kod, dosyaAdi] of Object.entries(DOSYALAR)) {
  const p = path.join(dir, kod + '.txt');
  if (!fs.existsSync(p)) continue;
  let sayfaNo = 0;
  for (const satir of fs.readFileSync(p, 'utf8').split('\n')) {
    const m0 = satir.match(/^===== SAYFA (\d+) =====$/);
    if (m0) { sayfaNo = +m0[1]; continue; }
    const m = satir.match(/^\s*(d(?:er|ie|as)\s+\w[\wäöüß-]*)\s*→\s*(d(?:er|ie|as)\s+\w[\wäöüß-]*)\s*=\s*(.+?)\s*$/i);
    if (m) sonuc.kelimeCiftleri.push({ kaynak: dosyaAdi, kod, sayfa: sayfaNo, tekil: m[1], cogul: m[2], anlam: m[3] });
  }
}

fs.writeFileSync(cikti, JSON.stringify(sonuc, null, 1), 'utf8');
console.log('Ceviri paragrafi : ' + sonuc.paragraflar.length);
console.log('Turkce diyalog   : ' + sonuc.diyaloglar.length);
console.log('Kelime listesi   : ' + sonuc.kelimeListeleri.length + ' sayfa');
console.log('Tekil→cogul cifti: ' + sonuc.kelimeCiftleri.length);
console.log('\nEn uzun 5 paragraf:');
for (const x of [...sonuc.paragraflar].sort((a, b) => b.uzunluk - a.uzunluk).slice(0, 5))
  console.log('  ' + x.kod + ' s.' + x.sayfa + ' (' + x.kelimeSayisi + ' kelime): ' + x.metin.slice(0, 90) + '...');
