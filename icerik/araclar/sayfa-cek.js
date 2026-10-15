// PDF sayfasini PNG'ye cevirir (poppler olmadan, Playwright + pdf.js ile).
// Kullanim: node sayfa-cek.js <pdf> <ilkSayfa> <sonSayfa> [olcek]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const kok = path.resolve(__dirname, '..', '..');
const [pdfAd, ilk, son, olcek] = process.argv.slice(2);
const SCALE = Number(olcek || 2);

(async () => {
  const pdfYol = path.join(kok, pdfAd);
  if (!fs.existsSync(pdfYol)) { console.error('PDF yok:', pdfYol); process.exit(1); }
  const b64 = fs.readFileSync(pdfYol).toString('base64');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });
  page.on('console', m => { if (m.type() === 'error') console.error('SAYFA HATASI:', m.text()); });
  await page.setContent('<!doctype html><html><body style="margin:0"><canvas id="c"></canvas></body></html>');
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });
  await page.evaluate(() => { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; });
  const toplam = await page.evaluate(async (d) => {
    const bin = atob(d); const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    window.__pdf = await pdfjsLib.getDocument({ data: arr }).promise;
    return window.__pdf.numPages;
  }, b64);
  console.log('toplam sayfa:', toplam);
  const kisa = path.basename(pdfAd, '.pdf').replace(/[^A-Za-z0-9]/g, '');
  for (let n = Number(ilk); n <= Math.min(Number(son), toplam); n++) {
    await page.evaluate(async ({ n, SCALE }) => {
      const p = await window.__pdf.getPage(n);
      const vp = p.getViewport({ scale: SCALE });
      const c = document.getElementById('c');
      c.width = vp.width; c.height = vp.height;
      await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    }, { n, SCALE });
    const dosya = path.join(kok, 'icerik', 'sayfa', `${kisa}-${String(n).padStart(3,'0')}.png`);
    await page.locator('#c').screenshot({ path: dosya });
    console.log('cekildi:', path.basename(dosya));
  }
  await browser.close();
})();
