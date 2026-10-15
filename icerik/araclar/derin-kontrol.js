// Derin kontrol testi (Opus incelemesi, 15 Ekim 2026 gecesi).
// gece-testi.js'ten farkı: değerleri window.X yerine doğrudan okur (const/let değişkenler
// window'a bağlanmaz, eski test bu yüzden hep 0 görüyordu) ve bağlantıların sadece
// sözdizimini değil, GERÇEKTEN doğru ekranı açtığını da doğrular.
// Çalıştırma: node icerik/araclar/derin-kontrol.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const kok = path.resolve(__dirname, '..', '..');
const URL = 'file:///' + path.join(kok, 'index.html').replace(/\\/g, '/');

const hatalar = [], uyarilar = [], bilgi = [];

// 1) Tüm satır içi <script> bloklarının sözdizimi
{
  const html = fs.readFileSync(path.join(kok, 'index.html'), 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, i = 0;
  while ((m = re.exec(html))) {
    i++;
    try { new vm.Script(m[1], { filename: 'script#' + i }); }
    catch (e) { hatalar.push('SÖZDİZİMİ script#' + i + ': ' + e.message); }
  }
  bilgi.push('Sözdizimi kontrol edilen script bloğu: ' + i);
}

(async () => {
  const browser = await chromium.launch();

  async function yeniSayfa(tema) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'tr-TR' });
    const page = await ctx.newPage();
    const hata = [];
    page.on('pageerror', e => hata.push('PAGEERROR: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND|service worker|ServiceWorker/i.test(m.text())) hata.push('CONSOLE: ' + m.text()); });
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.addInitScript(t => { try { localStorage.clear(); localStorage.setItem('almanca_tema', t); } catch (e) {} }, tema || 'light');
    await page.goto(URL);
    await page.waitForTimeout(500);
    return { ctx, page, hata };
  }

  // 2) Veri bütünlüğü
  {
    const { ctx, page, hata } = await yeniSayfa();
    const r = await page.evaluate(() => {
      const h = [], u = [];
      // CATS
      const yeni = ['Sayılar', 'Renkler', 'Kıyafet', 'Aile', 'Yiyecek', 'Saat'];
      yeni.forEach(k => { if (!CATS[k]) h.push('CATS eksik: ' + k); });
      const deMap = {};
      for (const [k, c] of Object.entries(CATS)) {
        c.words.forEach((w, i) => {
          if (!w.de || !w.tr) h.push('CATS boş alan: ' + k + '[' + i + ']');
          if (yeni.includes(k) && !w.h) u.push('CATS ipucu yok: ' + k + ' ' + w.de);
          const anahtar = w.de.trim();
          (deMap[anahtar] = deMap[anahtar] || []).push(k + '→' + w.tr);
        });
      }
      for (const [de, l] of Object.entries(deMap)) if (l.length > 1) u.push('Aynı kelime birden çok kategoride: ' + de + ' = ' + l.join(' | '));
      // YAZMA_TEXTS
      YAZMA_TEXTS.forEach((t, i) => {
        const m = /^(\d+) parça/.exec(t.desc || '');
        if (m && +m[1] !== t.chunks.length) h.push('YAZMA desc parça sayısı yanlış: ' + t.title + ' (' + m[1] + ' yazıyor, ' + t.chunks.length + ' var)');
        t.chunks.forEach((c, j) => ['tr', 'de', 'logic', 'mistake'].forEach(f => { if (!c[f] || !String(c[f]).trim()) h.push('YAZMA boş ' + f + ': ' + t.title + '#' + j); }));
      });
      // GRAMER_TOPICS: doğru cevap şıklarda mı, şıklar benzersiz mi
      GRAMER_TOPICS.forEach(t => (t.qs || []).forEach((q, j) => {
        if (q.opts && !q.opts.includes(q.blank)) h.push('GRAMER doğru cevap şıklarda yok: ' + t.id + '#' + j);
        if (q.opts && new Set(q.opts).size !== q.opts.length) h.push('GRAMER tekrar eden şık: ' + t.id + '#' + j);
      }));
      // PLAN30 bağlantı hedefleri
      const hedefler = [];
      PLAN30.gunler.forEach(g => g.k.forEach(k => {
        if (!k[4]) return;
        hedefler.push({ g: g.g, ad: k[1], kod: k[4] });
        let m;
        if ((m = /^openGrTopic\('([^']+)'\)$/.exec(k[4]))) { if (!GRAMER_TOPICS.find(x => x.id === m[1])) h.push('PLAN30 olmayan gramer id: ' + m[1]); }
        else if ((m = /^goCatSelect\('(\w+)','([^']+)'\)$/.exec(k[4]))) { if (!CATS[m[2]]) h.push('PLAN30 olmayan kategori: ' + m[2]); }
        else if ((m = /^(\w+)\(/.exec(k[4]))) { if (typeof window[m[1]] !== 'function') h.push('PLAN30 olmayan fonksiyon: ' + m[1]); }
        else h.push('PLAN30 tanınmayan bağlantı: ' + k[4]);
      }));
      const db = defaultDB();
      if (!db.plan || !db.plan.tamam) h.push('defaultDB plan alanı yok');
      return {
        h, u, hedefler,
        sayi: { kat: Object.keys(CATS).length, yeniKelime: yeni.reduce((s, k) => s + (CATS[k] ? CATS[k].words.length : 0), 0),
          yazma: YAZMA_TEXTS.length, yazmaParca: YAZMA_TEXTS.slice(-6).reduce((s, t) => s + t.chunks.length, 0),
          gramer: GRAMER_TOPICS.length, baglanti: hedefler.length }
      };
    });
    hatalar.push(...r.h, ...hata); uyarilar.push(...r.u);
    bilgi.push('Sayılar: ' + JSON.stringify(r.sayi));

    // 3) Her takvim bağlantısını temiz sayfada GERÇEKTEN çalıştır
    for (const b of r.hedefler) {
      const s = await yeniSayfa();
      try {
        const sonuc = await s.page.evaluate(kod => { const once = curScreen; (new Function(kod))(); return { once, sonra: curScreen, kat: typeof activeCat !== 'undefined' ? activeCat : null }; }, b.kod);
        await s.page.waitForTimeout(150);
        let beklenen = null, m;
        if ((m = /^goCatSelect\('(\w+)','([^']+)'\)$/.exec(b.kod))) {
          if (sonuc.sonra !== 'learnScreen' || sonuc.kat !== m[2]) hatalar.push('BAĞLANTI çalışmadı: gün ' + b.g + ' ' + b.kod + ' → ' + JSON.stringify(sonuc));
        } else if (/^openGrTopic/.test(b.kod)) {
          if (sonuc.sonra !== 'gramerTopicScreen') hatalar.push('BAĞLANTI çalışmadı: gün ' + b.g + ' ' + b.kod + ' → ' + sonuc.sonra);
        } else if (sonuc.sonra === sonuc.once) hatalar.push('BAĞLANTI ekran değiştirmedi: gün ' + b.g + ' ' + b.kod);
        hatalar.push(...s.hata.map(x => 'gün ' + b.g + ' ' + b.kod + ': ' + x));
      } catch (e) { hatalar.push('BAĞLANTI hata: gün ' + b.g + ' ' + b.kod + ': ' + e.message); }
      await s.ctx.close();
    }
    bilgi.push('Çalıştırılan takvim bağlantısı: ' + r.hedefler.length);
    await ctx.close();
  }

  // 4) Her yazma grubunu doğru cevaplarla (ve alternatiflerle) baştan sona oyna
  {
    const { ctx, page, hata } = await yeniSayfa();
    const r = await page.evaluate(() => {
      const h = [];
      YAZMA_TEXTS.forEach((t, i) => {
        startYazma(i);
        const cevaplar = [];
        t.chunks.forEach(c => { cevaplar.push(c.de); (c.alt || []).forEach(a => cevaplar.push(a)); });
        // önce alternatifleri tek tek dene
        t.chunks.forEach((c, j) => [c.de, ...(c.alt || [])].forEach(a => {
          yzIdx = j; renderYazmaQ();
          document.getElementById('yazmaInput').value = a; checkYazma();
          if (!document.getElementById('yazmaInput').classList.contains('t-ok')) h.push('YAZMA doğru cevap reddedildi: ' + t.title + '#' + j + ' "' + a + '"');
        }));
        // sonra normal akışla bitir
        startYazma(i);
        t.chunks.forEach(c => { document.getElementById('yazmaInput').value = c.de; checkYazma(); yazmaNextQ(); });
        if (curScreen !== 'yazmaDoneScreen') h.push('YAZMA bitiş ekranı açılmadı: ' + t.title);
      });
      return h;
    });
    hatalar.push(...r, ...hata);
    await ctx.close();
  }

  // 5) Ekranları iki temada gez: taşma + kontrast
  for (const tema of ['light', 'dark']) {
    const { ctx, page, hata } = await yeniSayfa(tema);
    const adimlar = [
      ['ana ekran', () => {}],
      ...['Sayılar', 'Renkler', 'Kıyafet', 'Aile', 'Yiyecek', 'Saat'].map(k => ['kategori ' + k, `goCatSelect('learn','${k}')`]),
      ['liste', `goCat('list'); catGo();`],
      ['imperativ', `openGrTopic('imperativ')`],
      ['yazma listesi', `openYazmaList()`],
      ['yazma yanlış cevap', `startYazma(YAZMA_TEXTS.length-2); document.getElementById('yazmaInput').value='falsch'; checkYazma();`],
    ];
    for (const [ad, kod] of adimlar) {
      await page.evaluate(k => { if (typeof k === 'string') { goHome(); (new Function(k))(); } }, typeof kod === 'string' ? kod : null);
      await page.waitForTimeout(450);
      const r = await page.evaluate(() => {
        const sorun = [];
        const de = document.documentElement;
        if (de.scrollWidth > window.innerWidth + 1) sorun.push('yatay taşma: ' + de.scrollWidth + 'px');
        const rgb = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };
        const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
        const bgOf = el => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; const c = rgb(cs.backgroundColor); if (c && (c.length < 4 || c[3] > .5)) return c; } return [255, 255, 255]; };
        const gorulen = new Set();
        document.querySelectorAll('body *').forEach(el => {
          if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
          const metin = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
          if (!metin) return;
          const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return;
          if (r.right > window.innerWidth + 1 && getComputedStyle(el).overflow === 'visible') { const k = 'taşan: ' + metin.slice(0, 30); if (!gorulen.has(k)) { gorulen.add(k); sorun.push(k + ' (' + Math.round(r.right) + 'px)'); } }
          const bg = bgOf(el); if (!bg) return;
          const fg = rgb(getComputedStyle(el).color); if (!fg) return;
          if (fg.length === 4 && fg[3] < .5) return;
          const L1 = lum(fg), L2 = lum(bg); const oran = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
          if (oran < 3) { const k = 'düşük kontrast ' + oran.toFixed(2) + ': "' + metin.slice(0, 30) + '" (' + el.className + ')'; if (!gorulen.has(k)) { gorulen.add(k); sorun.push(k); } }
        });
        return { ekran: curScreen, sorun };
      });
      r.sorun.forEach(s => uyarilar.push('[' + tema + '] ' + ad + ' (' + r.ekran + '): ' + s));
      await page.screenshot({ path: path.join(kok, 'icerik', 'ss', 'derin-' + tema + '-' + ad.replace(/\s+/g, '_') + '.png') });
    }
    hatalar.push(...hata.map(x => '[' + tema + '] ' + x));
    await ctx.close();
  }

  await browser.close();
  console.log('========== BİLGİ ==========\n' + bilgi.join('\n'));
  console.log('\n========== UYARILAR (' + uyarilar.length + ') ==========\n' + (uyarilar.join('\n') || '(yok)'));
  console.log('\n========== HATALAR (' + hatalar.length + ') ==========\n' + (hatalar.join('\n') || '(hiç hata yok)'));
  process.exitCode = hatalar.length ? 1 : 0;
})();
