// Kapsama denetimi: konu anlatimi, gun-konu baglari, bozuk baglanti, b: ve wrongExp eksikleri.
// Kullanim: node icerik/araclar/kapsama-testi.js
// Cikis kodu: eksik varsa 1, temizse 0.
const { chromium } = require('playwright');
const path = require('path');
const kok = path.resolve(__dirname, '..', '..');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'tr-TR' });
  const page = await ctx.newPage();
  const sayfaHatalari = [];
  page.on('pageerror', e => sayfaHatalari.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') sayfaHatalari.push('CONSOLE: ' + m.text()); });
  await page.goto('file:///' + path.join(kok, 'index.html').split(path.sep).join('/'));
  await page.waitForTimeout(1200);

  const r = await page.evaluate(() => {
    const out = {};
    const varMi = (ad) => typeof window[ad] !== 'undefined';

    // ── KONULAR omurgasi ────────────────────────────────
    if (typeof KONULAR === 'undefined') {
      out.konular = { kurulu: false };
    } else {
      const anlatimsiz = KONULAR.filter(k => !k.anlatim && !k.gr && !k.slayt).map(k => k.no + ' ' + k.ad);
      out.konular = {
        kurulu: true, toplam: KONULAR.length,
        anlatimsiz, anlatimsizSayi: anlatimsiz.length,
        alistirmasiz: KONULAR.filter(k => !k.alis || !k.alis.length).map(k => k.no + ' ' + k.ad),
      };
    }

    // ── PLAN30: her gun bir konuya/eyleme bagli mi ──────
    const gunler = PLAN30.gunler;
    const eylemsizGunler = [], bozukBaglanti = [];
    let toplamMadde = 0, eylemliMadde = 0;
    gunler.forEach(g => {
      let e = 0;
      (g.k || []).forEach(m => {
        toplamMadde++;
        const eylem = m[4];
        const konuNo = (m[0] && m[0] > 0) ? m[0] : null;
        if (eylem || konuNo != null) { e++; eylemliMadde++; }
        if (eylem) {
          const fn = String(eylem).split('(')[0].trim();
          if (typeof window[fn] !== 'function') bozukBaglanti.push('G' + g.g + ': ' + eylem + ' → fonksiyon yok');
        }
      });
      if (e === 0) eylemsizGunler.push(g.g);
    });
    out.plan = { gun: gunler.length, toplamMadde, eylemliMadde, eylemsizGunler, bozukBaglanti };

    // ── Icerik takvimde geciyor mu ──────────────────────
    const planMetni = JSON.stringify(PLAN30);
    const grHepsi = GRAMER_TOPICS.map(t => t.id);
    const katHepsi = Object.keys(CATS);
    out.takvimDisi = {
      gramer: grHepsi.filter(id => !planMetni.includes("'" + id + "'") && !planMetni.includes('"' + id + '"')),
      kategori: katHepsi.filter(k => !planMetni.includes(k)),
    };

    // ── Kelime bagiam cumlesi (b:) ──────────────────────
    const eksikB = {};
    let toplamKelime = 0, bOlan = 0;
    Object.entries(CATS).forEach(([ad, o]) => {
      const yok = o.words.filter(w => !w.b || !w.b.de);
      toplamKelime += o.words.length;
      bOlan += o.words.length - yok.length;
      if (yok.length) eksikB[ad] = yok.length;
    });
    out.baglam = { toplamKelime, bOlan, eksik: toplamKelime - bOlan, kategoriKirilimi: eksikB };

    // ── Gramer yanlis-sik aciklamasi (wrongExp) ─────────
    const eksikW = {};
    let toplamSoru = 0, wOlan = 0;
    GRAMER_TOPICS.forEach(t => {
      const yok = (t.qs || []).filter(q => !q.wrongExp);
      toplamSoru += (t.qs || []).length;
      wOlan += (t.qs || []).length - yok.length;
      if (yok.length) eksikW[t.id] = yok.length;
    });
    out.wrongExp = { toplamSoru, wOlan, eksik: toplamSoru - wOlan, konuKirilimi: eksikW };

    return out;
  });

  await browser.close();

  const yaz = (s) => console.log(s);
  yaz('══════ KAPSAMA RAPORU ══════\n');

  yaz('── KONU OMURGASI ──');
  if (!r.konular.kurulu) yaz('  ✗ KONULAR dizisi henuz yok');
  else {
    yaz(`  konu: ${r.konular.toplam}`);
    yaz(`  anlatimi olmayan: ${r.konular.anlatimsizSayi}`);
    r.konular.anlatimsiz.slice(0, 15).forEach(k => yaz('     - ' + k));
    if (r.konular.alistirmasiz.length) yaz(`  alistirmasi olmayan: ${r.konular.alistirmasiz.length}`);
  }

  yaz('\n── 30 GUNLUK PROGRAM ──');
  yaz(`  gun: ${r.plan.gun}   madde: ${r.plan.toplamMadde}   baglantili madde: ${r.plan.eylemliMadde}`);
  yaz(`  HIC icerigi olmayan gun: ${r.plan.eylemsizGunler.length ? r.plan.eylemsizGunler.join(', ') : 'yok ✓'}`);
  yaz(`  bozuk baglanti: ${r.plan.bozukBaglanti.length ? '' : 'yok ✓'}`);
  r.plan.bozukBaglanti.forEach(b => yaz('     ✗ ' + b));

  yaz('\n── TAKVIM DISI ICERIK ──');
  yaz(`  gramer konusu: ${r.takvimDisi.gramer.length ? r.takvimDisi.gramer.join(', ') : 'yok ✓'}`);
  yaz(`  kelime kategorisi: ${r.takvimDisi.kategori.length ? r.takvimDisi.kategori.join(', ') : 'yok ✓'}`);

  yaz('\n── KELIME BAGLAM CUMLESI (b:) ──');
  yaz(`  ${r.baglam.bOlan} / ${r.baglam.toplamKelime} kelimede var   eksik: ${r.baglam.eksik}`);
  Object.entries(r.baglam.kategoriKirilimi).forEach(([k, n]) => yaz(`     - ${k}: ${n} eksik`));

  yaz('\n── GRAMER YANLIS-SIK ACIKLAMASI (wrongExp) ──');
  yaz(`  ${r.wrongExp.wOlan} / ${r.wrongExp.toplamSoru} soruda var   eksik: ${r.wrongExp.eksik}`);
  Object.entries(r.wrongExp.konuKirilimi).forEach(([k, n]) => yaz(`     - ${k}: ${n} eksik`));

  if (sayfaHatalari.length) {
    yaz('\n── SAYFA HATALARI ──');
    sayfaHatalari.forEach(h => yaz('  ✗ ' + h));
  }

  const sorun = (r.konular.kurulu ? r.konular.anlatimsizSayi : 1)
    + r.plan.eylemsizGunler.length + r.plan.bozukBaglanti.length
    + r.takvimDisi.gramer.length + r.takvimDisi.kategori.length
    + r.baglam.eksik + r.wrongExp.eksik + sayfaHatalari.length;
  yaz(`\n══════ TOPLAM ACIK: ${sorun} ══════`);
  process.exit(sorun ? 1 : 0);
})();
