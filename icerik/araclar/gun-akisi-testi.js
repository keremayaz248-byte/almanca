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

// ── Senaryo: okul gunu programi (gorev 4.x) ──────────────────────────────
async function gunSenaryosu(browser) {
  const { ctx, page } = await sayfaAc(browser);
  const kartMetni = () => page.evaluate(() => document.getElementById('bugunWrap').innerText);
  const basGunOnce = n => page.evaluate(n => { const d = isoToDate(todayStr()); d.setDate(d.getDate() - n); DB.okul.bas = isoLocal(d); saveDB(); renderBugun(); }, n);

  // program baslamamis
  let t = await kartMetni();
  kontrol('baslamamis: program baslat dugmesi', /Programı bugün başlat/.test(t) && /konu 1/.test(t), t.slice(0, 80));

  // baslat -> gun 1
  await page.click('#bugunWrap .bugun-bas'); await page.waitForTimeout(200);
  t = await kartMetni();
  kontrol('gun 1 / 45', /Gün 1 \/ 45/.test(t), t.slice(0, 60));
  kontrol('gun 1 konulari: Alfabe, Selamlasma, Nasilsiniz', /Alfabe/.test(t) && /Selamlaşma/.test(t) && /Nasılsınız/.test(t));
  kontrol('adimlar: anlatim, alistirma, aksam', /Konu anlatımı/.test(t) && /Alıştırma ve test/.test(t) && /Akşam sınavı/.test(t));
  kontrol('Devam et dugmesi', /Devam et — Konu anlatımı/.test(t));

  // Devam et -> konu 1 anlatimi
  await page.click('#bugunWrap .bugun-bas'); await page.waitForTimeout(250);
  const ekran = await page.evaluate(() => ({ ekran: curScreen, konu: document.getElementById('konuAd').textContent }));
  kontrol('Devam et konu 1 anlatimini acar', ekran.ekran === 'konuScreen' && /Alfabe/.test(ekran.konu), JSON.stringify(ekran));

  // anlatim adimi bitince sonraki adim: alistirma
  await page.evaluate(() => { [1, 2, 3].forEach(n => { DB.konu[n] = { adim: 1, bitti: false }; }); saveDB(); goHome(); });
  await page.waitForTimeout(200); t = await kartMetni();
  kontrol('anlatim bitti -> sonraki: Alistirma', /Devam et — Alıştırma ve test/.test(t), t.slice(-160));

  // konular bitince sonraki adim: aksam sinavi
  await page.evaluate(() => { [1, 2, 3].forEach(n => { DB.konu[n] = { adim: 4, bitti: true }; }); saveDB(); renderBugun(); });
  t = await kartMetni();
  kontrol('ders bitti -> sonraki: Aksam sinavi', /Devam et — Akşam sınavı/.test(t), t.slice(-160));

  // aksam sinavi yapilinca gun tamam
  await page.evaluate(() => { DB.okul.aksam[todayStr()] = { yapildi: true }; saveDB(); renderBugun(); });
  t = await kartMetni();
  kontrol('gun tamam mesaji', /Bugünü tamamladın/.test(t) && /Yarın:/.test(t), t.slice(-160));

  // kalicilik
  await page.reload(); await page.waitForTimeout(500);
  t = await kartMetni();
  kontrol('yeniden acinca gun ve tamamlanma korunur', /Gün 1 \/ 45/.test(t) && /Bugünü tamamladın/.test(t), t.slice(0, 80));

  // atlanan gun: 3 gun sonra
  await page.evaluate(() => { DB.konu = {}; DB.okul.aksam = {}; DB.okul.tamam = {}; saveDB(); });
  await basGunOnce(3);
  t = await kartMetni();
  kontrol('gun 4 + eksik gunler listesi', /Gün 4 \/ 45/.test(t) && /Eksik kalan günler/.test(t) && /Gün 1 ·/.test(t) && /Gün 3 ·/.test(t), t.slice(0, 200));
  await page.click('.okul-eksik .btn-sm-orange'); await page.waitForTimeout(250);
  kontrol('Tamamla eksik gunun konusunu acar', await page.evaluate(() => curScreen === 'konuScreen'));
  await page.evaluate(() => goHome());

  // tekrar gunu (gun 7)
  await basGunOnce(6);
  t = await kartMetni();
  kontrol('gun 7 tekrar gunu', /Gün 7 \/ 45/.test(t) && /Tekrar: konu 1–13/.test(t) && /Devam et — Tekrar/.test(t), t.slice(0, 160));
  await page.click('#bugunWrap .bugun-bas'); await page.waitForTimeout(250);
  kontrol('tekrar gunu tekrari baslatir ve isaretler', await page.evaluate(() => !!DB.okul.tamam[7] && curScreen !== 'homeScreen'));
  await page.evaluate(() => goHome());

  // Teil-2 konusu: icerik hazirlaniyor, gunu engellemez
  await page.evaluate(() => { DB.okul.tamam = {}; DB.okul.aksam = {}; saveDB(); });
  await basGunOnce(28);
  t = await kartMetni();
  kontrol('gun 29: Genitiv hazirlaniyor, ders adimlari engellemiyor', /Gün 29 \/ 45/.test(t) && /Genitiv/.test(t) && /hazırlanıyor/.test(t) && /Devam et — Akşam sınavı/.test(t), t.slice(0, 220));

  // program sonu
  await basGunOnce(60);
  t = await kartMetni();
  kontrol('program sonunda son gune sabitlenir (45)', /Gün 45 \/ 45/.test(t), t.slice(0, 60));
  await tasmaYok(page, 'bugun karti');
  await ctx.close();
}

// ── Senaryo: sinav akisi (gorev 5.x) ─────────────────────────────────────
async function sinavSenaryosu(browser) {
  const { ctx, page } = await sayfaAc(browser);
  const ekranBekle = (ad) => page.waitForFunction(a => curScreen === a, ad, { timeout: 15000 });
  // Hören oturumunu bitirir: yanlisIdx'teki sorulari bilerek yanlis yapar
  const horenBitir = (yanlisIdx) => page.evaluate((yanlis) => {
    while (curScreen === 'horenScreen') {
      const q = hQs[hIdx];
      const sec = yanlis.includes(hIdx) ? (q.c + 1) % q.o.length : q.c;
      document.querySelectorAll('#horenOpts .opt')[sec].click();
      horenSonraki();
    }
  }, yanlisIdx);

  // 1) Hören: Teil sirali, 6+4+5
  await page.evaluate(() => startDinleme()); await ekranBekle('horenScreen');
  const d1 = await page.evaluate(() => ({ teil: hQs.map(q => q.teil), toplam: hQs.length }));
  const sayim = [1, 2, 3].map(t => d1.teil.filter(x => x === t).length);
  const sirali = d1.teil.every((x, i) => i === 0 || x >= d1.teil[i - 1]);
  kontrol('Horen: Teil 1 → 2 → 3 sirali', sirali, d1.teil.join(''));
  kontrol('Horen: 6 + 4 + 5 = 15 madde', sayim.join() === '6,4,5', sayim.join());
  const bolum = await page.evaluate(() => document.getElementById('horenTeil').textContent);
  kontrol('Horen: Teil yonergesi gorunur', /Teil 1 · kısa diyalog/.test(bolum), bolum);
  const kez = await page.evaluate(() => document.getElementById('horenKez').textContent);
  kontrol('Horen: yeni bolum duyurusu', /Yeni bölüm/.test(kez), kez);

  // 2) iki soruyu yanlis yap -> sonuc kaydi + zayif konu
  const beklenenZayif = await page.evaluate(() => [...new Set(hQs.slice(0, 2).map(q => HOREN_KONU_ESLE[q.konu]).filter(n => n))].sort());
  await horenBitir([0, 1]);
  await ekranBekle('horenDoneScreen');
  const k1 = await page.evaluate(() => { const s = DB.okul.sinav; return { son: s[s.length - 1], zayif: DB.okul.zayif }; });
  kontrol('Horen sonucu kaydedildi', k1.son && k1.son.bolum === 'horen' && k1.son.toplam === 15 && k1.son.dogru === 13, JSON.stringify(k1.son));
  kontrol('yanlis yapilan konular kayitta ve zayif listesinde', JSON.stringify([...k1.son.zayif].sort()) === JSON.stringify(beklenenZayif) && beklenenZayif.every(n => k1.zayif[n]), 'beklenen ' + beklenenZayif + ' kayit ' + JSON.stringify(k1));

  // 3) Lesen
  await page.evaluate(() => openLesen()); await ekranBekle('lesenScreen');
  await page.evaluate(() => { while (curScreen === 'lesenScreen') { const it = lQs[lIdx]; document.querySelectorAll('#lesenOpts .opt')[it.q.c].click(); lesenSonraki(); } });
  await ekranBekle('lesenDoneScreen');
  const k2 = await page.evaluate(() => DB.okul.sinav[DB.okul.sinav.length - 1]);
  kontrol('Lesen sonucu kaydedildi (15 soru)', k2.bolum === 'lesen' && k2.toplam === 15 && k2.dogru === 15, JSON.stringify(k2));

  // 4) kalicilik + Sinav sekmesinde gecmis
  await page.reload(); await page.waitForTimeout(500);
  await page.evaluate(() => goTab('sinav')); await page.waitForTimeout(200);
  const g = await page.evaluate(() => document.getElementById('sinavGecmisWrap').innerText);
  kontrol('yeniden acinca gecmis duruyor (Horen + Lesen)', /Hören/.test(g) && /Lesen/.test(g), g.replace(/\n/g, ' | '));

  // 5) etiket esleme tablosu eksiksiz
  const eksik = await page.evaluate(() => [...new Set(SINAV_HOREN.map(q => q.konu))].filter(e => !(e in HOREN_KONU_ESLE)));
  kontrol('eslenmemis sinav etiketi 0', eksik.length === 0, eksik.join());
  const gecersiz = await page.evaluate(() => Object.values(HOREN_KONU_ESLE).filter(n => n && !konuBul(n)));
  kontrol('esleme tablosundaki her konu gercek', gecersiz.length === 0, gecersiz.join());

  // 6) zayif konu ertesi gun tekrar adimi
  await page.evaluate(() => { DB.okul.bas = todayStr(); DB.okul.zayif = { 6: '2000-01-01' }; DB.konu = {}; DB.okul.aksam = {}; saveDB(); goTab('bugun'); });
  await page.waitForTimeout(200);
  let t = await page.evaluate(() => document.getElementById('bugunWrap').innerText);
  kontrol('Bugun: zayif konu tekrar adimi cikti', /Zayıf konu tekrarı: Sayılar/.test(t) && /Devam et — Zayıf konu/.test(t), t.slice(0, 200));
  await page.click('#bugunWrap .bugun-bas'); await page.waitForTimeout(250);
  const acik = await page.evaluate(() => ({ e: curScreen, k: document.getElementById('konuAd').textContent, kaldi: !!DB.okul.zayif[6] }));
  kontrol('Devam et zayif konuyu acar ve listeden duser', acik.e === 'konuScreen' && /Sayılar/.test(acik.k) && !acik.kaldi, JSON.stringify(acik));
  await page.evaluate(() => goHome());

  // 7) Deneme sinavi: Horen -> Lesen -> Schreiben -> ozet
  await page.evaluate(() => startDeneme()); await ekranBekle('horenScreen');
  await page.evaluate(() => { while (curScreen === 'horenScreen' && hIdx < hQs.length) { document.querySelectorAll('#horenOpts .opt')[hQs[hIdx].c].click(); horenSonraki(); } });
  await ekranBekle('lesenScreen');
  kontrol('deneme: Horen sonrasi Lesen kendiliginden', true);
  await page.evaluate(() => { while (curScreen === 'lesenScreen' && lIdx < lQs.length) { document.querySelectorAll('#lesenOpts .opt')[lQs[lIdx].q.c].click(); lesenSonraki(); } });
  await ekranBekle('yazmaScreen');
  kontrol('deneme: Lesen sonrasi Schreiben kendiliginden', true);
  await page.evaluate(() => { let n = 0; while (curScreen === 'yazmaScreen' && yzIdx < yzChunks.length && n++ < 20) { const c = yzChunks[yzIdx]; document.getElementById('yazmaInput').value = c.de; checkYazma(); yazmaNextQ(); } });
  await ekranBekle('denemeDoneScreen');
  const oz = await page.evaluate(() => ({ metin: document.getElementById('denemeOzet').innerText, sub: document.getElementById('denemeDoneSub').textContent, son: DB.okul.sinav[DB.okul.sinav.length - 1] }));
  kontrol('deneme ozeti: uc bolum + toplam', /Hören/.test(oz.metin) && /Lesen/.test(oz.metin) && /Schreiben/.test(oz.metin) && /Toplam/.test(oz.sub), oz.metin.replace(/\n/g, ' | '));
  kontrol('deneme sonucu kaydedildi', oz.son.bolum === 'deneme' && oz.son.dogru === oz.son.toplam, JSON.stringify(oz.son));

  // 8) deneme yarida birakilirsa normal oturum denemeye karismaz
  await page.evaluate(() => { startDeneme(); }); await ekranBekle('horenScreen');
  await page.evaluate(() => goHome());
  kontrol('goHome denemeyi temizler', await page.evaluate(() => DENEME === null));
  await tasmaYok(page, 'sinav akisi');
  await ctx.close();
}

// ── Senaryo: aksam sinavi, 20:00 kapisi, takvim (gorev 6.x) ──────────────
async function aksamSenaryosu(browser) {
  const programKur = async (page) => {
    await page.evaluate(() => { DB.okul.bas = todayStr(); DB.okul.aksam = {}; DB.okul.tamam = {}; DB.konu = {}; DB.okul.zayif = {}; saveDB(); });
  };

  // 1) 19:59 -> kapi yok
  { const { ctx, page } = await sayfaAc(browser, { saat: '2026-10-20T19:59:00' });
    await programKur(page); await page.reload(); await page.waitForTimeout(500);
    kontrol('19:59: kapi yok, ana ekran acik', await page.evaluate(() => curScreen === 'homeScreen'));
    // takvim adresi
    await page.evaluate(() => { window.__acilan = null; window.open = (u) => { window.__acilan = u; }; });
    await page.evaluate(() => takvimeEkle());
    const u = await page.evaluate(() => window.__acilan);
    kontrol('takvim adresi: sablon, gunluk tekrar, Istanbul, 20:00 (17:00Z)',
      /^https:\/\/calendar\.google\.com\/calendar\/render\?action=TEMPLATE/.test(u) && /recur=RRULE:FREQ=DAILY/.test(u) && /ctz=Europe\/Istanbul/.test(u) && /dates=20261020T170000Z\/20261020T173000Z/.test(u), u);
    kontrol('takvim bolumunde bildirim notu', /kendi takvim ayarına bağlı/.test(await page.evaluate(() => document.querySelector('.takvim-not').innerText)));
    await ctx.close(); }

  // 2) 20:01 -> kapi, ertele bir kez, ikinci acilista ertelenemez, sinav, sonra serbest
  { const { ctx, page } = await sayfaAc(browser, { saat: '2026-10-20T20:01:00' });
    await programKur(page); await page.reload(); await page.waitForTimeout(500);
    kontrol('20:01: kapi ekrani', await page.evaluate(() => curScreen === 'aksamKapiScreen'));
    kontrol('ilk acilista Ertele var', await page.isVisible('#aksamErteleBtn'));
    kontrol('kapida geri tusu gizli', await page.evaluate(() => !document.getElementById('hdrBack').classList.contains('show')));
    await page.evaluate(() => { window.__acilan = null; window.open = (u) => { window.__acilan = u; }; });
    await page.click('#aksamErteleBtn'); await page.waitForTimeout(250);
    kontrol('Ertele -> normal acilir ve kaydedilir', await page.evaluate(() => curScreen === 'homeScreen' && DB.okul.aksam[todayStr()].ertelendi === true));
    await page.reload(); await page.waitForTimeout(500);
    kontrol('ikinci acilista kapi geri gelir', await page.evaluate(() => curScreen === 'aksamKapiScreen'));
    kontrol('ikinci acilista Ertele YOK', !(await page.isVisible('#aksamErteleBtn')));

    await page.click('#aksamKapiScreen .btn-start'); await page.waitForTimeout(300);
    const s = await page.evaluate(() => ({ ekran: curScreen, aksam: AKSAM, n: gtQs.length, basliklar: [...new Set(gtQs.map(q => q.topicTitle))] }));
    kontrol('sinav basladi (akşam modu, soru var)', s.ekran === 'gramerTestScreen' && s.aksam === true && s.n >= 8, JSON.stringify(s));
    kontrol('sorular bugunun konusunu icerir (Selamlasma)', s.basliklar.includes('Selamlaşma'), s.basliklar.join());
    // ilk soruyu yanlis, kalanini dogru yap
    await page.evaluate(() => {
      let ilk = true;
      while (curScreen === 'gramerTestScreen' && gtIdx < gtQs.length) {
        const q = gtQs[gtIdx];
        const secenekler = [...document.querySelectorAll('#gtOpts .gr-opt')];
        const hedef = ilk ? secenekler.find(b => b.textContent !== q.blank) : secenekler.find(b => b.textContent === q.blank);
        ilk = false; hedef.click(); gtNextQ();
      }
    });
    await page.waitForFunction(() => curScreen === 'gramerTestDoneScreen');
    const b = await page.evaluate(() => ({ a: DB.okul.aksam[todayStr()], son: DB.okul.sinav[DB.okul.sinav.length - 1], zayif: DB.okul.zayif, gizli: document.getElementById('gtTekrarBtn').style.display, bugun: document.getElementById('gtBugunBtn').style.display, kalanAksam: AKSAM }));
    kontrol('sinav sonucu kaydedildi (yapildi)', b.a.yapildi === true && b.son.bolum === 'aksam' && b.son.toplam === b.a.toplam, JSON.stringify(b));
    kontrol('yanlis yapilan konu zayif listesinde', Object.keys(b.zayif).length >= 1, JSON.stringify(b.zayif));
    kontrol('bitis ekrani: Bugun dugmesi, Tekrar gizli, mod kapandi', b.gizli === 'none' && b.bugun === '' && b.kalanAksam === false);
    await page.reload(); await page.waitForTimeout(500);
    kontrol('sinav yapilinca kapi yok', await page.evaluate(() => curScreen === 'homeScreen'));
    await page.evaluate(() => goTab('bugun')); await page.waitForTimeout(150);
    const t = await page.evaluate(() => document.getElementById('bugunWrap').innerText);
    kontrol('Bugun: aksam adimi tamam gorunur', /Akşam sınavı/.test(t), t.slice(0, 160));
    await tasmaYok(page, 'aksam');
    await ctx.close(); }

  // 3) sinav gunu (45) kapi cikarmaz
  { const { ctx, page } = await sayfaAc(browser, { saat: '2026-10-20T21:00:00' });
    await page.evaluate(() => { const d = isoToDate(todayStr()); d.setDate(d.getDate() - 44); DB.okul.bas = isoLocal(d); DB.okul.aksam = {}; saveDB(); });
    await page.reload(); await page.waitForTimeout(500);
    kontrol('deneme sinavi gununde kapi cikmaz', await page.evaluate(() => curScreen === 'homeScreen'));
    await ctx.close(); }

  // 4) akşam sınavından yarım çıkış moda takılı kalmaz
  { const { ctx, page } = await sayfaAc(browser);
    await programKur(page);
    await page.evaluate(() => startAksamSinavi());
    await page.evaluate(() => hdrBackGo());
    kontrol('geri tusu aksam modunu kapatir ve ana ekrana doner', await page.evaluate(() => AKSAM === false && curScreen === 'homeScreen'));
    await page.evaluate(() => startGramerTest());
    kontrol('normal Kapsamli Test aksam modunda degil', await page.evaluate(() => AKSAM === false));
    await ctx.close(); }
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
    await gunSenaryosu(browser);
    await sinavSenaryosu(browser);
    await aksamSenaryosu(browser);
    // Yeni senaryolar bu satirin ustune eklenir.
    await browser.close();
    console.log('BASARILI:', sonuc.basarili.length);
    sonuc.basarili.forEach(s => console.log('  ok  ' + s));
    console.log('HATA:', sonuc.hatalar.length);
    sonuc.hatalar.forEach(s => console.log('  !!  ' + s));
    process.exit(sonuc.hatalar.length ? 1 : 0);
  })();
}
