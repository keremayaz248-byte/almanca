// Gomulu ders iceriklerinin (DERS_ICERIK) uctan uca testi: her konu icin
//  - konu ekrani dersi baslat dugmesi gosterir, deste sayfalari hatasiz gezilir (iki tema, 390px, tasma yok)
//  - deste bitince anlatim adimi islenir, alistirma acilir
//  - gramer testi >= %60 ile konu TAMAMLANIR, < %60 ile tamamlanmaz
//  - sorularin cevabi gercekten seceneklerde; kontrast ve konsol hatasi yok
// Kullanim: node icerik/araclar/ders-icerik-testi.js [konuNo ...]
const { chromium } = require('playwright');
const { sayfaAc, kontrol, tasmaYok, sonuc } = require('./gun-akisi-testi.js');

(async () => {
  const istenen = process.argv.slice(2).map(Number);
  const browser = await chromium.launch();
  const { ctx, page } = await sayfaAc(browser);
  const konular = await page.evaluate(() => Object.keys(DERS_ICERIK).map(Number));
  const hedef = istenen.length ? konular.filter(n => istenen.includes(n)) : konular;
  if (!hedef.length) { console.log('Gomulu ders icerigi yok; test edilecek bir sey yok.'); await browser.close(); process.exit(0); }
  await ctx.close();

  for (const no of hedef) {
    for (const tema of ['acik', 'koyu']) {
      const { ctx, page } = await sayfaAc(browser, { tema });
      const ad = '[konu ' + no + ' ' + tema + '] ';
      const bilgi = await page.evaluate(no => { const k = konuBul(no), d = SLIDE_DECKS['ders' + no]; return { slayt: k.slayt, gr: k.gr, sayfa: d && d.slides.length, soru: GRAMER_TOPICS.find(t => t.id === k.gr).qs.length }; }, no);
      kontrol(ad + 'deste ve gramer kayitli', bilgi.slayt === 'ders' + no && bilgi.sayfa >= 6 && bilgi.soru >= 8, JSON.stringify(bilgi));

      await page.evaluate(no => { DB.konu = {}; openKonu(no, 0); }, no); await page.waitForTimeout(250);
      const govde = await page.evaluate(() => document.getElementById('konuGovde').innerText);
      kontrol(ad + 'konu ekraninda "Dersi baslat"', /Dersi başlat/.test(govde), govde.slice(0, 120));

      // tum sayfalari gez
      await page.evaluate(no => openSlideDeck('ders' + no), no);
      for (let i = 0; i < bilgi.sayfa; i++) {
        await page.evaluate(i => slideGo(i), i); await page.waitForTimeout(650);
        const t = await page.evaluate(() => document.getElementById('slideStage').innerText);
        if (t.trim().length < 10) sonuc.hatalar.push('BASARISIZ: ' + ad + 'sayfa ' + (i + 1) + ' bos');
        const tas = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (tas > 1) sonuc.hatalar.push('BASARISIZ: ' + ad + 'sayfa ' + (i + 1) + ' yatay tasma ' + tas + 'px');
      }
      sonuc.basarili.push(ad + bilgi.sayfa + ' sayfa gezildi');

      // deste bitince anlatim adimi islenir ve alistirma acilir
      const bitis = await page.evaluate(no => { slideNext(); return { adim: konuDurumKaydi(no).adim, ekran: curScreen }; }, no);
      kontrol(ad + 'deste bitince anlatim adimi islendi, alistirma acildi', bitis.adim >= 1 && /gramerTopicScreen|gramerScreen/.test(bitis.ekran), JSON.stringify(bitis));

      // test: <%60 tamamlanmaz, >=%60 tamamlanir
      const sonuc1 = await page.evaluate(no => {
        const k = konuBul(no); DB.konu = {}; KONU_TEST_AKTIF = no; openGrTopic(k.gr);
        const t = grTopic; let i = 0;
        while (grQIdx < t.qs.length) { const q = t.qs[grQIdx]; const sec = [...document.querySelectorAll('#grOpts .gr-opt')]; (i++ % 2 === 0 ? sec.find(b => b.textContent !== q.blank) : sec.find(b => b.textContent !== q.blank)).click(); grNextQ(); }
        return { durum: konuDurum(no), kalan: KONU_TEST_AKTIF };
      }, no);
      kontrol(ad + 'hepsi yanlisken konu tamamlanmaz', sonuc1.durum !== 'tamam' && sonuc1.kalan === no, JSON.stringify(sonuc1));
      const sonuc2 = await page.evaluate(no => {
        const k = konuBul(no); DB.konu = {}; KONU_TEST_AKTIF = no; openGrTopic(k.gr);
        const t = grTopic;
        while (grQIdx < t.qs.length) { const q = t.qs[grQIdx]; [...document.querySelectorAll('#grOpts .gr-opt')].find(b => b.textContent === q.blank).click(); grNextQ(); }
        return { durum: konuDurum(no), mesaj: document.getElementById('grSent').innerText, kalan: KONU_TEST_AKTIF };
      }, no);
      kontrol(ad + 'hepsi dogruyken konu tamamlandi', sonuc2.durum === 'tamam' && /tamamlandı/.test(sonuc2.mesaj) && sonuc2.kalan === null, JSON.stringify(sonuc2));

      // akşam sınavı havuzu bu konudan soru verebilir
      const havuz = await page.evaluate(no => { const k = konuBul(no); return konuSorulari(k, 4).length; }, no);
      kontrol(ad + 'aksam havuzu konudan soru uretiyor', havuz >= 3, 'soru ' + havuz);
      await tasmaYok(page, ad);
      await ctx.close();
    }
  }
  await browser.close();
  console.log('BASARILI:', sonuc.basarili.length);
  sonuc.hatalar.forEach(s => console.log('  !!  ' + s));
  console.log('HATA:', sonuc.hatalar.length);
  process.exit(sonuc.hatalar.length ? 1 : 0);
})();
