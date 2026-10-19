// Perplexity'ye (perplexity.ai) Playwright ile soru sorar ve cevabi yazdirir / dosyaya kaydeder.
// Kullanim: node icerik/araclar/perplexity-sor.js "soru metni" [--dosya cikti.txt] [--bekle 120]
// Oturum: repo kokundeki _pplx_profile/ klasorunde kalici (git'e girmez, .gitignore'da).
// Not: ayni profili ayni anda iki surec acamaz; baska bir Perplexity penceresi aciksa once kapatin.
// Cevap, 5 saniye boyunca degismeyince tamamlanmis sayilir.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const kok = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2);
const soru = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--dosya' && args[args.indexOf(a) - 1] !== '--bekle');
const opt = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const dosya = opt('dosya');
const azamiSn = parseInt(opt('bekle') || '120', 10);

if (!soru) { console.error('Kullanim: node perplexity-sor.js "soru" [--dosya cikti.txt] [--bekle 120]'); process.exit(2); }

(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(kok, '_pplx_profile'), {
    channel: 'chrome', headless: false, viewport: { width: 1100, height: 800 },
  });
  try {
    const p = ctx.pages()[0] || await ctx.newPage();
    await p.goto('https://www.perplexity.ai/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForTimeout(3500);
    const kutu = await p.$('textarea, [contenteditable="true"]');
    if (!kutu) throw new Error('Soru kutusu bulunamadi (bot engeli ya da arayuz degismis olabilir).');
    await kutu.click();
    await p.keyboard.type(soru, { delay: 6 });
    await p.keyboard.press('Enter');

    let onceki = '', degismedi = 0;
    for (let sn = 0; sn < azamiSn; sn++) {
      await p.waitForTimeout(1000);
      const t = await p.evaluate(() => document.body.innerText);
      if (t === onceki && t.length > soru.length + 200) { if (++degismedi >= 5) break; } else degismedi = 0;
      onceki = t;
    }
    // Soru metninden sonrasini al, alttaki arayuz yazilarini ("kaynak" satirina kadar) kes
    const bas = onceki.lastIndexOf(soru.slice(0, 60));
    let cevap = bas >= 0 ? onceki.slice(bas + soru.length) : onceki;
    const son = cevap.search(/\n\d+\s*kaynak/i);
    if (son > 0) cevap = cevap.slice(0, son);
    cevap = cevap.trim();
    if (dosya) { fs.writeFileSync(path.resolve(dosya), cevap, 'utf8'); console.log('Cevap yazildi:', path.resolve(dosya), '(' + cevap.length + ' karakter)'); }
    else console.log(cevap);
  } finally {
    await ctx.close();
  }
})().catch(e => { console.error('HATA:', e.message); process.exit(1); });
