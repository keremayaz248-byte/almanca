// Supabase entegrasyon testi: giris ekrani, anahtar gecerliligi, tema
const { chromium } = require('playwright');
const path = require('path');
const kok = path.resolve(__dirname, '..', '..');
(async () => {
  const browser = await chromium.launch();
  const hatalar = [];
  for (const tema of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'tr-TR' });
    const page = await ctx.newPage();
    page.on('pageerror', e => hatalar.push(tema + ' PAGEERROR: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') hatalar.push(tema + ' CONSOLE: ' + m.text()); });
    await page.addInitScript((t) => { try { localStorage.setItem('almanca_tema', t); } catch (e) {} }, tema);
    await page.goto('file:///' + path.join(kok, 'index.html').split(path.sep).join('/'));
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({
      supabaseYuklu: typeof window.supabase !== 'undefined',
      hazir: typeof sbHazirMi === 'function' && sbHazirMi(),
      overlayGorunur: getComputedStyle(document.getElementById('loginOverlay')).display,
    }));
    console.log(tema, JSON.stringify(r));
    await page.screenshot({ path: path.join(kok, 'icerik', 'ss', 'login-' + tema + '.png') });
    if (tema === 'light') {
      // Sahte bilgiyle giris: anahtar gecerliyse "Invalid login credentials" doner, gecersizse "Invalid API key"
      await page.fill('#loginEmailInput', 'yok-boyle-biri@example.com');
      await page.fill('#loginPwInput', 'yanlis-parola-123');
      await page.click('#loginBtn');
      await page.waitForTimeout(3000);
      console.log('SAHTE GIRIS MESAJI:', await page.textContent('#loginMsg'));
    }
    await ctx.close();
  }
  await browser.close();
  console.log('HATA SAYISI:', hatalar.length);
  hatalar.forEach(h => console.log(h));
})();
