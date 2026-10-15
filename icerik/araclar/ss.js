// Uygulamanin ana ekranindan telefon boyutunda ekran goruntusu alir.
// Kullanim: node icerik/araclar/ss.js [cikti_klasoru]
const { chromium } = require('playwright');
const path = require('path');

const kok = path.resolve(__dirname, '..', '..');
const cikti = process.argv[2] || path.join(kok, 'icerik', 'ss');

(async () => {
  const browser = await chromium.launch();
  const hatalar = [];

  for (const tema of ['light', 'dark']) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      locale: 'tr-TR',
    });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') hatalar.push(tema + ': ' + m.text()); });
    page.on('pageerror', e => hatalar.push(tema + ' PAGEERROR: ' + e.message));

    await page.addInitScript(t => {
      try { localStorage.setItem('almanca_tema', t); } catch (e) {}
    }, tema);

    await page.goto('file:///' + path.join(kok, 'index.html').replace(/\\/g, '/'));
    await page.waitForTimeout(1200);

    await page.screenshot({ path: path.join(cikti, 'ana-' + tema + '.png') });
    await page.screenshot({ path: path.join(cikti, 'ana-' + tema + '-tam.png'), fullPage: true });

    // Takvim gercekten cizilmis mi?
    const rapor = await page.evaluate(() => ({
      planVar: !!document.querySelector('.plan-today'),
      takvimVar: !!document.querySelector('.plan-cal'),
      gunSayisi: document.querySelectorAll('.pc-day').length,
      bugunVar: !!document.querySelector('.pc-today'),
      basligi: (document.querySelector('.pt-kicker') || {}).textContent || '(yok)',
      konular: [...document.querySelectorAll('.pt-ad')].map(e => e.textContent),
      temaBtn: (document.getElementById('themeBtn') || {}).textContent || '(yok)',
      tema: document.documentElement.getAttribute('data-theme'),
    }));
    console.log('--- ' + tema.toUpperCase() + ' ---');
    console.log(JSON.stringify(rapor, null, 1));
    await ctx.close();
  }

  await browser.close();
  console.log(hatalar.length ? '\nKONSOL HATALARI:\n' + hatalar.join('\n') : '\nKonsol hatasi yok.');
})();
