// Gun akisi / alt menu / aksam sinavi / hedef sinav testleri icin ortak iskelet.
// Kullanim: node icerik/araclar/gun-akisi-testi.js
// Her yeni ozellik gorevinden sonra buraya bir "senaryo" eklenir; cikis kodu: hata varsa 1.
const { chromium } = require('playwright');
const path = require('path');
const kok = path.resolve(__dirname, '..', '..');
const SAYFA = 'file:///' + path.join(kok, 'index.html').replace(/\\/g, '/');

const sonuc = { hatalar: [], basarili: [] };

// opts.saat: 'YYYY-MM-DDTHH:MM:SS' verilirse tarayici saati sabitlenir (20:00 kapisi testleri icin).
async function sayfaAc(browser, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: opts.genislik || 390, height: opts.yukseklik || 844 },
    locale: 'tr-TR',
    colorScheme: opts.tema === 'koyu' ? 'dark' : 'light',
  });
  // Supabase giris katmani testi engellemesin
  await ctx.addInitScript(() => { try { localStorage.setItem('almanca_login_skip', '1'); } catch (e) {} });
  if (opts.saat) {
    const t = new Date(opts.saat).valueOf();
    await ctx.addInitScript(`{ const _D = Date, ofs = ${t} - _D.now();
      class FD extends _D { constructor(...a){ if(a.length){ super(...a); } else { super(_D.now()+ofs); } } static now(){ return _D.now()+ofs; } }
      window.Date = FD; }`);
  }
  const page = await ctx.newPage();
  page.on('pageerror', e => sonuc.hatalar.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/MIME type|Failed to load resource/.test(m.text())) sonuc.hatalar.push('CONSOLE: ' + m.text()); });
  await page.goto(SAYFA);
  await page.waitForTimeout(600);
  return { ctx, page };
}

function kontrol(ad, kosul, ayrinti) {
  if (kosul) sonuc.basarili.push(ad);
  else sonuc.hatalar.push('BASARISIZ: ' + ad + (ayrinti ? ' -> ' + ayrinti : ''));
}

// Yatay tasma ve acik kalan hata kutusu icin ortak denetim
async function tasmaYok(page, ad) {
  const t = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  kontrol(ad + ': yatay tasma yok', t <= 1, 'fark ' + t + 'px');
}

module.exports = { sayfaAc, kontrol, tasmaYok, sonuc, kok };

// ── Senaryo: alt menu ve dort sekme (gorev 3.x) ──────────────────────────
const { execSync } = require('child_process');
function homeTiklar(html) {
  const a = html.indexOf('<div id="homeScreen">'), b = html.indexOf('<!-- LESEN');
  return new Set((html.slice(a, b).match(/onclick="[^"]*"/g) || []));
}
async function sekmeSenaryosu(browser) {
  // 1) Eski ana ekrandaki her giris hala bir yerde mi? (HEAD = degisiklikten onceki hal)
  const eski = homeTiklar(execSync('git show HEAD:index.html', { cwd: kok, maxBuffer: 1 << 28 }).toString('utf8'));
  const yeni = homeTiklar(require('fs').readFileSync(path.join(kok, 'index.html'), 'utf8'));
  const bilincliKalkan = ['onclick="toggleEk()"']; // Ek Calisma artik sekmelere dagildi
  const kayip = [...eski].filter(x => !yeni.has(x) && !bilincliKalkan.includes(x));
  kontrol('eski girislerin hepsi hala var', kayip.length === 0, 'kayip: ' + kayip.join(' ; '));

  for (const tema of ['acik', 'koyu']) {
    const { ctx, page } = await sayfaAc(browser, { tema });
    const ad = '[' + tema + '] ';
    const durum = () => page.evaluate(() => ({
      aktif: document.querySelector('#bottomNav .bn.on')?.dataset.tab,
      navGorunur: getComputedStyle(document.getElementById('bottomNav')).display !== 'none',
      gorunenSekmeler: [...new Set([...document.querySelectorAll('#homeScreen .tab-sec')]
        .filter(e => getComputedStyle(e).display !== 'none').map(e => e.dataset.tab))],
      hometab: document.getElementById('homeScreen').getAttribute('data-hometab'),
    }));
    let d = await durum();
    kontrol(ad + 'aciliste Bugun sekmesi', d.aktif === 'bugun' && d.hometab === 'bugun' && d.navGorunur, JSON.stringify(d));
    kontrol(ad + 'Bugun: yalniz bugun bolumleri', d.gorunenSekmeler.join() === 'bugun', d.gorunenSekmeler.join());
    for (const t of ['ogren', 'sinav', 'pratik', 'bugun']) {
      await page.click('#bottomNav .bn[data-tab="' + t + '"]');
      await page.waitForTimeout(250);
      d = await durum();
      kontrol(ad + t + ' sekmesi secili', d.aktif === t && d.hometab === t, JSON.stringify(d));
      kontrol(ad + t + ': yalniz kendi bolumleri', d.gorunenSekmeler.join() === t, d.gorunenSekmeler.join());
      await tasmaYok(page, ad + t);
    }
    // icerik kontrolu: her sekmede beklenen kart gorunur
    const var_ = async (t, sel) => { await page.click('#bottomNav .bn[data-tab="' + t + '"]'); await page.waitForTimeout(150);
      return page.evaluate(s => { const e = document.querySelector('#homeScreen ' + s); return !!e && e.offsetParent !== null; }, sel); };
    kontrol(ad + 'Bugun: gunun karti', await var_('bugun', '#bugunWrap'));
    kontrol(ad + 'Sinav: Hören/Lesen/Schreiben kartlari', await var_('sinav', '.sinav-grid'));
    kontrol(ad + 'Ogren: konu ozeti', await var_('ogren', '#konuOzetWrap'));
    kontrol(ad + 'Ogren: Gramer Konulari karti', await var_('ogren', '[onclick="openGramer()"]'));
    kontrol(ad + 'Pratik: Hizli Test karti', await var_('pratik', '[onclick="startHizliTest()"]'));
    kontrol(ad + 'Pratik: Duello', await var_('pratik', '#duelloSection'));
    // dokunma hedefi
    const boy = await page.evaluate(() => [...document.querySelectorAll('#bottomNav .bn')].map(b => Math.round(b.getBoundingClientRect().height)));
    kontrol(ad + 'menu dugmeleri >= 44px', boy.every(x => x >= 44), boy.join(','));
    // alt menu ekranlarda
    await page.evaluate(() => showScreen('konuListScreen')); await page.waitForTimeout(150);
    d = await durum();
    kontrol(ad + 'konu listesinde menu gorunur ve Ogren secili', d.navGorunur && d.aktif === 'ogren', JSON.stringify(d));
    await page.evaluate(() => showScreen('yazmaListScreen')); await page.waitForTimeout(150);
    d = await durum();
    kontrol(ad + 'yazma listesinde Sinav secili', d.navGorunur && d.aktif === 'sinav', JSON.stringify(d));
    for (const e of ['horenScreen', 'lesenScreen', 'yazmaScreen', 'gameScreen', 'mcScreen']) {
      await page.evaluate(x => showScreen(x), e); await page.waitForTimeout(100);
      d = await durum();
      kontrol(ad + e + ': menu gizli', !d.navGorunur, JSON.stringify(d));
    }
    // goHome() son acik sekmeye doner
    await page.evaluate(() => { goTab('pratik'); showScreen('horenScreen'); goHome(); }); await page.waitForTimeout(150);
    d = await durum();
    kontrol(ad + 'goHome son sekmeye doner (pratik)', d.hometab === 'pratik' && d.aktif === 'pratik', JSON.stringify(d));
    await page.screenshot({ path: path.join(kok, 'icerik', 'ss', 'sekme-' + tema + '.png') });
    await ctx.close();
  }
}

// Dogrudan calistirildiginda
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    const { ctx, page } = await sayfaAc(browser);
    kontrol('sayfa aciliyor', await page.evaluate(() => typeof showScreen === 'function'));
    await tasmaYok(page, 'ana ekran');
    await ctx.close();
    await sekmeSenaryosu(browser);
    // Yeni senaryolar bu satirin ustune eklenir.
    await browser.close();
    console.log('BASARILI:', sonuc.basarili.length);
    sonuc.basarili.forEach(s => console.log('  ok  ' + s));
    console.log('HATA:', sonuc.hatalar.length);
    sonuc.hatalar.forEach(s => console.log('  !!  ' + s));
    process.exit(sonuc.hatalar.length ? 1 : 0);
  })();
}
