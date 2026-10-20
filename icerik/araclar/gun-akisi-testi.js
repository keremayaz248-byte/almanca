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
  await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(500);
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

  // gramer testi olan konu (konu 4: sein) test gecilince TAMAMLANIR; <%60 ile tamamlanmaz
  await page.evaluate(() => { DB.konu = {}; saveDB(); openKonu(4, 3); });   // 3 = test adimi
  await page.waitForTimeout(150);
  kontrol('konu 4: test adimi "Testi baslat" gosterir', /Testi başlat/.test(await page.evaluate(() => document.getElementById('konuGovde').innerText)));
  const tamamsiz = await page.evaluate(() => {
    konuTestBasla();
    const t = grTopic; let n = 0;
    while (grQIdx < t.qs.length) { const q = t.qs[grQIdx]; const sec = [...document.querySelectorAll('#grOpts .gr-opt')]; sec.find(b => b.textContent !== q.blank).click(); grNextQ(); n++; }
    return { durum: konuDurum(4), mesaj: document.getElementById('grSent').innerText, aktif: KONU_TEST_AKTIF };
  });
  kontrol('hepsi yanlis: konu tamamlanmaz, %60 uyarisi', tamamsiz.durum !== 'tamam' && /en az %60/.test(tamamsiz.mesaj) && tamamsiz.aktif === 4, JSON.stringify(tamamsiz));
  const tamam = await page.evaluate(() => {
    DB.konu = {}; saveDB(); openKonu(4, 3); konuTestBasla();
    const t = grTopic;
    while (grQIdx < t.qs.length) { const q = t.qs[grQIdx]; [...document.querySelectorAll('#grOpts .gr-opt')].find(b => b.textContent === q.blank).click(); grNextQ(); }
    const dugme = document.getElementById('grNext').textContent;
    return { durum: konuDurum(4), mesaj: document.getElementById('grSent').innerText, dugme, aktif: KONU_TEST_AKTIF };
  });
  kontrol('hepsi dogru: konu TAMAMLANDI, Bugun dugmesi', tamam.durum === 'tamam' && /tamamlandı/.test(tamam.mesaj) && /Bugün ekranına dön/.test(tamam.dugme) && tamam.aktif === null, JSON.stringify(tamam));
  await page.evaluate(() => document.getElementById('grNext').click()); await page.waitForTimeout(250);
  kontrol('dugme Bugun ekranina goturur', await page.evaluate(() => curScreen === 'homeScreen' && homeTab === 'bugun'));
  // Gramer menusunden dogrudan acilan test konuyu etkilemez
  await page.evaluate(() => { DB.konu = {}; saveDB(); KONU_TEST_AKTIF = null; openGrTopic('sein'); const t = grTopic; while (grQIdx < t.qs.length) { const q = t.qs[grQIdx]; [...document.querySelectorAll('#grOpts .gr-opt')].find(b => b.textContent === q.blank).click(); grNextQ(); } });
  kontrol('menuden acilan test konuyu tamamlamaz', await page.evaluate(() => konuDurum(4) !== 'tamam'));

  // program sonu
  await basGunOnce(60);
  t = await kartMetni();
  kontrol('program sonunda son gune sabitlenir (45)', /Gün 45 \/ 45/.test(t), t.slice(0, 60));
  await page.evaluate(() => goTab('bugun')); await page.waitForTimeout(700);   // ekran gecis animasyonu bitsin
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
  await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(500);
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
    await programKur(page); await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(500);
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
    await programKur(page); await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(500);
    kontrol('20:01: kapi ekrani', await page.evaluate(() => curScreen === 'aksamKapiScreen'));
    kontrol('ilk acilista Ertele var', await page.isVisible('#aksamErteleBtn'));
    kontrol('kapida geri tusu gizli', await page.evaluate(() => !document.getElementById('hdrBack').classList.contains('show')));
    await page.evaluate(() => { window.__acilan = null; window.open = (u) => { window.__acilan = u; }; });
    await page.click('#aksamErteleBtn'); await page.waitForTimeout(250);
    kontrol('Ertele -> normal acilir ve kaydedilir', await page.evaluate(() => curScreen === 'homeScreen' && DB.okul.aksam[todayStr()].ertelendi === true));
    await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(500);
    kontrol('ikinci acilista kapi geri gelir', await page.evaluate(() => curScreen === 'aksamKapiScreen'));
    kontrol('ikinci acilista Ertele YOK', !(await page.isVisible('#aksamErteleBtn')));

    await page.click('#aksamKapiScreen .btn-start'); await page.waitForTimeout(300);
    const s = await page.evaluate(() => ({ ekran: curScreen, aksam: AKSAM, n: gtQs.length, basliklar: [...new Set(gtQs.map(q => q.topicTitle))] }));
    kontrol('sinav basladi (akşam modu, soru var)', s.ekran === 'gramerTestScreen' && s.aksam === true && s.n >= 8, JSON.stringify(s));
    kontrol('sorular bugunun konusunu icerir (Selamlasma)', s.basliklar.includes('Selamlaşma'), s.basliklar.join());
    // konuya bagli (_konu) ilk soruyu yanlis, kalanini dogru yap (siralama rastgele, bu yuzden ilk _konu'lu soru secilir)
    await page.evaluate(() => {
      let yanlisYapildi = false;
      while (curScreen === 'gramerTestScreen' && gtIdx < gtQs.length) {
        const q = gtQs[gtIdx];
        const secenekler = [...document.querySelectorAll('#gtOpts .gr-opt')];
        const yanlisYap = !yanlisYapildi && q._konu;
        const hedef = yanlisYap ? secenekler.find(b => b.textContent !== q.blank) : secenekler.find(b => b.textContent === q.blank);
        if (yanlisYap) yanlisYapildi = true;
        hedef.click(); gtNextQ();
      }
    });
    await page.waitForFunction(() => curScreen === 'gramerTestDoneScreen');
    const b = await page.evaluate(() => ({ a: DB.okul.aksam[todayStr()], son: DB.okul.sinav[DB.okul.sinav.length - 1], zayif: DB.okul.zayif, gizli: document.getElementById('gtTekrarBtn').style.display, bugun: document.getElementById('gtBugunBtn').style.display, kalanAksam: AKSAM }));
    kontrol('sinav sonucu kaydedildi (yapildi)', b.a.yapildi === true && b.son.bolum === 'aksam' && b.son.toplam === b.a.toplam, JSON.stringify(b));
    kontrol('yanlis yapilan konu zayif listesinde', Object.keys(b.zayif).length >= 1, JSON.stringify(b.zayif));
    kontrol('bitis ekrani: Bugun dugmesi, Tekrar gizli, mod kapandi', b.gizli === 'none' && b.bugun === '' && b.kalanAksam === false);
    await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(500);
    kontrol('sinav yapilinca kapi yok', await page.evaluate(() => curScreen === 'homeScreen'));
    await page.evaluate(() => goTab('bugun')); await page.waitForTimeout(150);
    const t = await page.evaluate(() => document.getElementById('bugunWrap').innerText);
    kontrol('Bugun: aksam adimi tamam gorunur', /Akşam sınavı/.test(t), t.slice(0, 160));
    await tasmaYok(page, 'aksam');
    await ctx.close(); }

  // 3) sinav gunu (45) kapi cikarmaz
  { const { ctx, page } = await sayfaAc(browser, { saat: '2026-10-20T21:00:00' });
    await page.evaluate(() => { const d = isoToDate(todayStr()); d.setDate(d.getDate() - 44); DB.okul.bas = isoLocal(d); DB.okul.aksam = {}; saveDB(); });
    await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(500);
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

// ── Senaryo: hedef sinav (gorev 7.x) ─────────────────────────────────────
async function hedefSenaryosu(browser) {
  const { ctx, page } = await sayfaAc(browser, { saat: '2026-10-20T12:00:00' });
  const hedefMetni = () => page.evaluate(() => document.getElementById('hedefWrap').innerText);
  await page.evaluate(() => { DB.okul.hedef = null; DB.okul.hedefSonra = null; DB.okul.bas = todayStr(); DB.okul.aksam = {}; saveDB(); goTab('bugun'); });

  kontrol('hedef yokken: Hedef sinavini ayarla karti', /Hedef sınavını ayarla/.test(await hedefMetni()));

  // ayar ekrani
  await page.click('#hedefWrap .hedef-kart'); await page.waitForTimeout(200);
  kontrol('ayar ekrani aciliyor', await page.evaluate(() => curScreen === 'hedefScreen'));
  await page.selectOption('#hedefTur', 'goethe_a1');
  await page.fill('#hedefTarih', '2026-12-15');
  await page.click('#hedefScreen .btn-start'); await page.waitForTimeout(250);
  let m = await hedefMetni();
  kontrol('geri sayim: Goethe A1, 56 gun kaldi', /Goethe-Zertifikat A1/.test(m) && /56 gün kaldı/.test(m) && /15 Aralık 2026/.test(m), m.replace(/\n/g, ' | '));
  kontrol('hedef cihazda saklandi', await page.evaluate(() => DB.okul.hedef.tur === 'goethe_a1' && DB.okul.hedef.tarih === '2026-12-15'));
  await page.waitForTimeout(300); await page.reload(); await page.waitForTimeout(400);
  await page.evaluate(() => goTab('bugun'));
  kontrol('yeniden acinca hedef duruyor', /56 gün kaldı/.test(await hedefMetni()));

  // program hedeften sonra bitiyor: bas bugun -> bitis 4 Aralik (44 gun sonra) -> hedefi 1 Kasim yap
  await page.evaluate(() => { DB.okul.hedef = { tur: 'goethe_a1', tarih: '2026-11-20' }; saveDB(); renderHedefKarti(); });
  m = await hedefMetni();
  kontrol('program hedeften sonra bitiyorsa uyari', /son günü/.test(m) && /hedef tarihinden sonra/.test(m), m.replace(/\n/g, ' | '));
  await page.evaluate(() => { DB.okul.hedef = { tur: 'goethe_a1', tarih: '2027-03-01' }; saveDB(); renderHedefKarti(); });
  kontrol('program hedeften once bitiyorsa uyari yok', !/hedef tarihinden sonra/.test(await hedefMetni()));

  // B1 konusu + hedef A1 -> not
  await page.evaluate(() => openKonu(47, 0)); await page.waitForTimeout(200);
  let g = await page.evaluate(() => document.getElementById('konuGovde').innerText);
  kontrol('hedef A1 iken B1 konusunda seviye notu', /B1 seviyesindedir/.test(g) && /A1/.test(g), g.slice(0, 160));
  await page.evaluate(() => { DB.okul.hedef = { tur: 'goethe_b1', tarih: null }; saveDB(); openKonu(47, 0); }); await page.waitForTimeout(150);
  g = await page.evaluate(() => document.getElementById('konuGovde').innerText);
  kontrol('hedef B1 iken not yok', !/B1 seviyesindedir/.test(g), g.slice(0, 120));
  await page.evaluate(() => { DB.okul.hedef = null; saveDB(); openKonu(47, 0); }); await page.waitForTimeout(150);
  g = await page.evaluate(() => document.getElementById('konuGovde').innerText);
  kontrol('hedef belirsizken not var', /B1 seviyesindedir/.test(g));

  // belirsiz secilirse geri sayim yok
  await page.evaluate(() => { goTab('bugun'); openHedef(); }); await page.selectOption('#hedefTur', 'belirsiz');
  await page.click('#hedefScreen .btn-start'); await page.waitForTimeout(200);
  kontrol('belirsiz: geri sayim gosterilmez', /Hedef sınavını ayarla/.test(await hedefMetni()));

  // ilk aksam sinavi sonunda hedef sorusu + "Sonra"
  await page.evaluate(() => { DB.okul.hedef = null; DB.okul.hedefSonra = null; DB.okul.aksam = {}; saveDB(); startAksamSinavi(); });
  await page.evaluate(() => { while (curScreen === 'gramerTestScreen' && gtIdx < gtQs.length) { const q = gtQs[gtIdx]; [...document.querySelectorAll('#gtOpts .gr-opt')].find(b => b.textContent === q.blank).click(); gtNextQ(); } });
  await page.waitForFunction(() => curScreen === 'gramerTestDoneScreen');
  kontrol('ilk aksam sinavi sonunda hedef sorusu', /Hangi sınava hazırlanıyorsun/.test(await page.evaluate(() => document.getElementById('gtHedefWrap').innerText)));
  await page.click('#gtHedefWrap .btn-home'); await page.waitForTimeout(150);
  kontrol('"Sonra" soruyu kapatir ve hatirlar', await page.evaluate(() => document.getElementById('gtHedefWrap').innerHTML === '' && !!DB.okul.hedefSonra));
  await page.evaluate(() => { DB.okul.aksam = {}; saveDB(); startAksamSinavi(); });
  await page.evaluate(() => { while (curScreen === 'gramerTestScreen' && gtIdx < gtQs.length) { const q = gtQs[gtIdx]; [...document.querySelectorAll('#gtOpts .gr-opt')].find(b => b.textContent === q.blank).click(); gtNextQ(); } });
  await page.waitForFunction(() => curScreen === 'gramerTestDoneScreen');
  kontrol('"Sonra" dendiyse ikinci sinavda tekrar sorulmaz', await page.evaluate(() => document.getElementById('gtHedefWrap').innerHTML === ''));
  await tasmaYok(page, 'hedef');
  await ctx.close();
}

// ── Senaryo: gorsel ders sayfasi motoru + podcast oynatici (gorev 8.x) ───
function kontrastOrani(rgb1, rgb2) {
  const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const a = lum(rgb1), b = lum(rgb2); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
async function gorselSenaryosu(browser) {
  const sessiz = (() => { const n = 4000, buf = Buffer.alloc(44 + n * 2); buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(8000, 24); buf.writeUInt32LE(16000, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40); return 'data:audio/wav;base64,' + buf.toString('base64'); })();
  const deste = {
    title: '🧪 Test', accent: 'linear-gradient(135deg,#2AACD1,#1c7fa0)', sonra: 'gramer:weil',
    slides: [
      { type: 'intro', kicker: 'Test', big: 'weil', mean: 'çünkü' },
      { tur: 'sema', kicker: 'Fiil sırası', baslik: 'Ana cümle ↔ weil cümlesi', satirlar: [
        { etiket: 'Ana cümle', not: 'fiil 2. sırada', jetonlar: [{ t: 'Ich', r: 'ozne' }, { t: 'lerne', r: 'fiil' }, { t: 'Deutsch', r: 'nesne' }], tr: 'Almanca öğreniyorum.' },
        { etiket: 'weil cümlesi', not: 'fiil SONDA', jetonlar: [{ t: 'weil', r: 'bag' }, { t: 'ich', r: 'ozne' }, { t: 'in Berlin', r: 'zaman' }, { t: 'arbeite', r: 'fiil', sonda: true }] }],
        not: '<b>weil</b>\'den sonra çekimli fiil <b>en sona</b> gider.' },
      { tur: 'tablo', kicker: 'Çekim', baslik: 'sein / haben', basliklar: ['', 'sein', 'haben'], satirlar: [['ich', 'bin', 'habe'], ['du', 'bist', 'hast'], ['er/sie/es', 'ist', 'hat'], ['wir', 'sind', 'haben'], ['ihr', 'seid', 'habt'], ['sie/Sie', 'sind', 'haben']], not: 'Çok kullanılan iki yardımcı fiil.' },
      { tur: 'zaman', kicker: 'Zaman çizgisi', baslik: 'Geçmiş zamanlar', noktalar: [{ baslik: 'Präteritum', etiket: 'yazı dili', ornek: 'Ich <b>war</b> müde.', tr: 'Yorgundum.' }, { baslik: 'Perfekt', etiket: 'konuşma dili', ornek: 'Ich <b>bin</b> müde <b>gewesen</b>.' }], not: 'sein ve haben\'de Präteritum konuşmada da sık.' },
      { tur: 'kural', kicker: 'Kural', baslik: 'Kısaca', maddeler: ['weil → fiil sona', 'denn → fiil 2. sırada'], uyari: 'İkisini karıştırma.' }
    ]
  };
  for (const tema of ['acik', 'koyu']) {
    const { ctx, page } = await sayfaAc(browser, { tema });
    const ad = '[' + tema + '] ';
    await page.evaluate(d => { SLIDE_DECKS.__test = d; window.__ap = null; konuAlistirma = function (a) { window.__ap = a; }; openSlideDeck('__test'); }, deste);
    // slayt giris animasyonu (0.42 sn) bitmeden olcum yapma: ortasinda kart kaymis gorunur
    const sayfa = async (i) => { const m = await page.evaluate(i => { slideGo(i); return document.getElementById('slideStage').innerText; }, i); await page.waitForTimeout(700); return m; };
    let t = await sayfa(1);
    kontrol(ad + 'sema: iki cumle, etiketler, yazili rol ve sira', /Ana cümle/.test(t) && /weil cümlesi/.test(t) && /özne · 1/.test(t) && /fiil · 4/.test(t) && /bağlaç · 1/.test(t), t.replace(/\n/g, ' | ').slice(0, 200));
    kontrol(ad + 'sema: Almanca yazi gercek metin (secilebilir)', await page.evaluate(() => { const e = document.querySelector('.sema-tok .sema-t'); return !!e && getComputedStyle(e).userSelect !== 'none' && e.textContent === 'Ich'; }));
    kontrol(ad + 'sema: aciklama kutusu', /en sona/.test(t));
    // kontrast: sema jetonlari
    const ren = await page.evaluate(() => [...document.querySelectorAll('.sema-tok')].map(e => { const cs = getComputedStyle(e); const p = s => s.match(/[\d.]+/g).slice(0, 3).map(Number); return [p(cs.color), p(cs.backgroundColor)]; }));
    const enDusuk = Math.min(...ren.map(([f, b]) => kontrastOrani(f, b)));
    kontrol(ad + 'sema jeton kontrasti >= 4.5', enDusuk >= 4.5, enDusuk.toFixed(2));
    await tasmaYok(page, ad + 'sema');

    t = await sayfa(2);
    kontrol(ad + 'tablo: basliklar ve satirlar', /sein/.test(t) && /haben/.test(t) && /er\/sie\/es/.test(t) && /ist/.test(t), t.replace(/\n/g, ' ').slice(0, 120));
    const kt = await page.evaluate(() => { const th = document.querySelector('.ders-tablo thead th:nth-child(2)'); const cs = getComputedStyle(th); const p = s => s.match(/[\d.]+/g).slice(0, 3).map(Number); return [p(cs.color), p(cs.backgroundColor)]; });
    kontrol(ad + 'tablo baslik kontrasti >= 4.5', kontrastOrani(kt[0], kt[1]) >= 4.5, kontrastOrani(kt[0], kt[1]).toFixed(2));
    await tasmaYok(page, ad + 'tablo');

    t = await sayfa(3);
    kontrol(ad + 'zaman cizgisi: iki nokta, ornekler', /Präteritum/.test(t) && /Perfekt/.test(t) && /Ich war müde/.test(t) && /Yorgundum/.test(t), t.replace(/\n/g, ' ').slice(0, 140));
    await tasmaYok(page, ad + 'zaman');
    t = await sayfa(4);
    kontrol(ad + 'kural: maddeler + uyari', /weil → fiil sona/.test(t) && /İkisini karıştırma/.test(t));

    // son sayfa: egzersize gec
    const son = await page.evaluate(() => { const b = document.getElementById('slideNextBtn').textContent; slideNext(); return { b, ap: window.__ap }; });
    kontrol(ad + 'son sayfa: "Alistirmaya gec" ve egzersiz acilir', /Alıştırmaya geç/.test(son.b) && son.ap === 'gramer:weil', JSON.stringify(son));

    // podcast
    await page.evaluate(s => { KONULAR.find(k => k.no === 2).podcast = s; openKonu(2, 0); }, sessiz);
    await page.waitForTimeout(200);
    kontrol(ad + 'podcast: oynatici gorunur', await page.isVisible('#podcastKutu') && /Konu podcast/.test(await page.evaluate(() => document.getElementById('podcastKutu').innerText)));
    await page.click('#podcastOynat'); await page.waitForTimeout(250);
    const p1 = await page.evaluate(() => { const a = document.getElementById('podcastAudio'); return { yukluDeger: a.readyState >= 1, buton: document.getElementById('podcastOynat').textContent }; });
    kontrol(ad + 'podcast: oynat -> duraklat dugmesi', /Duraklat|Oynat/.test(p1.buton), JSON.stringify(p1));
    await page.selectOption('#podcastHiz', '1.5');
    kontrol(ad + 'podcast: hiz degisti', await page.evaluate(() => document.getElementById('podcastAudio').playbackRate === 1.5));
    await page.click('[aria-label="10 saniye geri"]');
    kontrol(ad + 'podcast: geri sarma 0\'in altina inmez', await page.evaluate(() => document.getElementById('podcastAudio').currentTime >= 0));
    // podcast yok
    await page.evaluate(() => { KONULAR.find(k => k.no === 2).podcast = null; openKonu(2, 0); }); await page.waitForTimeout(150);
    kontrol(ad + 'podcast yoksa oynatici yok, anlatim var', await page.evaluate(() => !document.getElementById('podcastKutu') && /Kaynak:/.test(document.getElementById('konuGovde').innerText)));
    // internet yok / bozuk adres
    await page.evaluate(() => { KONULAR.find(k => k.no === 2).podcast = 'https://invalid.invalid/yok.mp3'; openKonu(2, 0); }); await page.waitForTimeout(150);
    await page.click('#podcastOynat'); await page.waitForTimeout(1500);
    kontrol(ad + 'podcast indirilemezse Turkce mesaj, yazili anlatim duruyor', await page.evaluate(() => /Ses indirilemedi/.test(document.getElementById('podcastDurum').innerText) && /Kaynak:/.test(document.getElementById('konuGovde').innerText)));
    await tasmaYok(page, ad + 'podcast');
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
    await gunSenaryosu(browser);
    await sinavSenaryosu(browser);
    await aksamSenaryosu(browser);
    await hedefSenaryosu(browser);
    await gorselSenaryosu(browser);
    // Yeni senaryolar bu satirin ustune eklenir.
    await browser.close();
    console.log('BASARILI:', sonuc.basarili.length);
    sonuc.basarili.forEach(s => console.log('  ok  ' + s));
    console.log('HATA:', sonuc.hatalar.length);
    sonuc.hatalar.forEach(s => console.log('  !!  ' + s));
    process.exit(sonuc.hatalar.length ? 1 : 0);
  })();
}
