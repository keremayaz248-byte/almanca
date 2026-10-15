const { chromium } = require('playwright');
const S = 'C:/Users/Administrator/AppData/Local/Temp/claude/c--Users-Administrator-Desktop-Almanca/298003a8-5404-4c41-bdbd-17cebeb6058a/scratchpad/';
const OUT = 'C:/Users/Administrator/Desktop/Almanca/icons/';

async function cek(b, dosya, boyut, hedef) {
  const page = await b.newPage({ viewport: { width: boyut, height: boyut }, deviceScaleFactor: 1 });
  await page.goto('file:///' + S + dosya, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.load("800 200px Fredoka"); await document.fonts.ready; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + hedef });
  await page.close();
}

(async () => {
  const b = await chromium.launch();
  await cek(b, 'icon.html', 192, 'icon-192.png');
  await cek(b, 'icon.html', 512, 'icon-512.png');
  await cek(b, 'icon.html', 180, 'apple-touch-icon.png');
  await cek(b, 'icon-maskable.html', 192, 'icon-maskable-192.png');
  await cek(b, 'icon-maskable.html', 512, 'icon-maskable-512.png');
  await b.close();
  console.log('Tum ikonlar uretildi.');
})();
