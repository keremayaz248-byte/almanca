// Uygulamayi kullanici gibi dene: ana ekranda ne gorunuyor, dinlemeye kac tiklamada ulasiliyor?
const { chromium } = require('playwright');
const path=require('path'); const kok=path.resolve(__dirname,'..','..');
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},locale:'tr-TR'});
  const p=await ctx.newPage(); const h=[];
  p.on('pageerror',e=>h.push('PAGEERROR: '+e.message));
  p.on('console',m=>{if(m.type()==='error')h.push('CONSOLE: '+m.text());});
  await p.addInitScript(()=>{try{localStorage.setItem('almanca_login_skip','1')}catch(e){}});
  await p.goto('file:///'+path.join(kok,'index.html').split(path.sep).join('/'));
  await p.waitForTimeout(1000);

  // 1) Ilk ekranda kaydirmadan ne gorunuyor?
  const gorunen=await p.evaluate(()=>{
    const out=[];
    document.querySelectorAll('#homeScreen .sec-head, #homeScreen .mode-card, #homeScreen .bugun-bas, #homeScreen .hero-card').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.top<844 && r.bottom>0) out.push((el.textContent||'').trim().replace(/\s+/g,' ').slice(0,48));
    });
    return out;
  });
  console.log('EKRANDA ILK GORUNEN:'); gorunen.forEach(x=>console.log('   •',x));

  // 2) "Dinleme" kelimesi ana ekranda gorunur mu, gorunmuyorsa neden?
  const dinleme=await p.evaluate(()=>{
    const el=[...document.querySelectorAll('#homeScreen *')].find(e=>e.classList&&e.classList.contains('mc-title')&&/Dinleme/.test(e.textContent));
    if(!el) return {var:false};
    const kart=el.closest('.mode-card'); const r=kart.getBoundingClientRect();
    const ek=document.getElementById('ekWrap');
    return {var:true, gizliKapsayici: ek?getComputedStyle(ek).display:'?', tepe:Math.round(r.top), genislik:Math.round(r.width)};
  });
  console.log('\nDINLEME KARTI:', JSON.stringify(dinleme));

  // 3) Sayfa ne kadar uzun, dinlemeye ulasmak icin ne kadar kaydirmak gerek?
  console.log('SAYFA YUKSEKLIGI:', await p.evaluate(()=>document.body.scrollHeight), 'px (ekran 844)');

  await p.screenshot({path:path.join(kok,'icerik','ss','kullanim-ilk.png')});
  console.log('\nHATA:',h.length); h.forEach(x=>console.log(' ',x));
  await b.close();
})();
