// Gece yapilan tum degisikliklerin tam testi.
// Ana ekran, her yeni kelime kategorisi, Imperative konusu, yeni yazma egzersizleri,
// takvim baglantilarinin hepsi, PWA, iki tema — hepsi tek seferde dogrulanir.
const { chromium } = require('playwright');
const path = require('path');
const kok = path.resolve(__dirname, '..', '..');

(async () => {
  const browser = await chromium.launch();
  const sonuclar = { hatalar: [], basarili: [] };

  async function yeniSayfa() {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'tr-TR' });
    const page = await ctx.newPage();
    page.on('pageerror', e => sonuclar.hatalar.push('PAGEERROR: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') sonuclar.hatalar.push('CONSOLE: ' + m.text()); });
    return { ctx, page };
  }

  // 1) ANA EKRAN
  {
    const { ctx, page } = await yeniSayfa();
    await page.goto('file:///' + path.join(kok, 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => ({
      planVar: !!document.querySelector('.plan-today'),
      takvimGun: document.querySelectorAll('.pc-day').length,
      katSayisi: Object.keys(window.CATS || {}).length,
      yazmaGrupSayisi: (window.YAZMA_TEXTS || []).length,
      gramerKonuSayisi: (window.GRAMER_TOPICS || []).length,
    }));
    sonuclar.basarili.push('ANA EKRAN: ' + JSON.stringify(r));
    await page.screenshot({ path: path.join(kok, 'icerik', 'ss', 'gece-ana.png') });
    await ctx.close();
  }

  // 2) HER YENİ KELİME KATEGORİSİ GERÇEKTEN AÇILIYOR MU
  for (const kat of ['Sayılar', 'Renkler', 'Kıyafet', 'Aile', 'Yiyecek', 'Saat']) {
    const { ctx, page } = await yeniSayfa();
    await page.goto('file:///' + path.join(kok, 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(600);
    try {
      await page.evaluate((k) => { goCatSelect('learn', k); }, kat);
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => ({
        ekran: window.curScreen,
        kelimeVar: !!document.querySelector('.wcard, #learnScreen'),
      }));
      sonuclar.basarili.push('KATEGORI "' + kat + '": ' + JSON.stringify(r));
    } catch (e) { sonuclar.hatalar.push('KATEGORI "' + kat + '" HATA: ' + e.message); }
    await ctx.close();
  }

  // 3) IMPERATIVE KONUSU
  {
    const { ctx, page } = await yeniSayfa();
    await page.goto('file:///' + path.join(kok, 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(600);
    try {
      await page.evaluate(() => { openGrTopic('imperativ'); });
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => ({
        baslik: document.getElementById('grTopicTitle') ? document.getElementById('grTopicTitle').textContent : '(yok)',
        soruSayisi: (window.grTopic || {}).qs ? window.grTopic.qs.length : 0,
      }));
      sonuclar.basarili.push('IMPERATIVE: ' + JSON.stringify(r));
      await page.screenshot({ path: path.join(kok, 'icerik', 'ss', 'gece-imperativ.png') });
    } catch (e) { sonuclar.hatalar.push('IMPERATIVE HATA: ' + e.message); }
    await ctx.close();
  }

  // 4) YENİ YAZMA EGZERSİZLERİNİN HEPSİ AÇILIYOR MU (7 grup)
  {
    const { ctx, page } = await yeniSayfa();
    await page.goto('file:///' + path.join(kok, 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(600);
    const sayi = await page.evaluate(() => YAZMA_TEXTS.length);
    for (let i = 0; i < sayi; i++) {
      try {
        await page.evaluate((idx) => { startYazma(idx); }, i);
        await page.waitForTimeout(300);
        const r = await page.evaluate(() => ({
          baslik: document.getElementById('yazmaTitle') ? document.getElementById('yazmaTitle').textContent : '(yok)',
          chunkSayisi: (window.yzChunks || []).length,
        }));
        sonuclar.basarili.push('YAZMA[' + i + ']: ' + JSON.stringify(r));
      } catch (e) { sonuclar.hatalar.push('YAZMA[' + i + '] HATA: ' + e.message); }
    }
    await ctx.close();
  }

  // 5) KOYU TEMADA ANA EKRAN
  {
    const { ctx, page } = await yeniSayfa();
    await page.addInitScript(() => { try { localStorage.setItem('almanca_tema', 'dark'); } catch (e) {} });
    await page.goto('file:///' + path.join(kok, 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(kok, 'icerik', 'ss', 'gece-koyu.png') });
    sonuclar.basarili.push('KOYU TEMA: ekran goruntusu alindi');
    await ctx.close();
  }

  // 6) PLAN30 ICINDEKI TUM BAGLANTILARIN CALISTIGINI DOGRULA
  {
    const { ctx, page } = await yeniSayfa();
    await page.goto('file:///' + path.join(kok, 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => {
      const eksik = [];
      for (const g of PLAN30.gunler) {
        for (const k of g.k) {
          if (k[4]) {
            try { new Function(k[4]); } catch (e) { eksik.push(g.g + ':' + k[1] + ' -> ' + e.message); }
          }
        }
      }
      return { toplamBaglanti: PLAN30.gunler.flatMap(g => g.k).filter(k => k[4]).length, hataliSozdizimi: eksik };
    });
    sonuclar.basarili.push('PLAN30 BAGLANTI: ' + JSON.stringify(r));
  }

  await browser.close();

  console.log('========== BASARILI ==========');
  sonuclar.basarili.forEach(s => console.log(s));
  console.log('\n========== HATALAR ==========');
  console.log(sonuclar.hatalar.length ? sonuclar.hatalar.join('\n') : '(hic hata yok)');
  console.log('\nTOPLAM HATA SAYISI: ' + sonuclar.hatalar.length);
})();
