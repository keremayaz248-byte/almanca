const { chromium } = require('playwright');
const path = require('path');
const kok = path.resolve(__dirname, '..', '..');
(async () => {
  const b = await chromium.launch();
  const hatalar=[];
  for (const tema of ['light','dark']) {
    const ctx = await b.newContext({ viewport:{width:390,height:1400}, locale:'tr-TR' });
    const p = await ctx.newPage();
    p.on('pageerror', e=>hatalar.push(tema+' PAGEERROR: '+e.message));
    p.on('console', m=>{ if(m.type()==='error') hatalar.push(tema+' CONSOLE: '+m.text()); });
    await p.addInitScript(t=>{try{localStorage.setItem('almanca_tema',t);localStorage.setItem('almanca_login_skip','1');}catch(e){}}, tema);
    await p.goto('file:///'+path.join(kok,'index.html').split(path.sep).join('/'));
    await p.waitForTimeout(1200);
    await p.screenshot({path:path.join(kok,'icerik','ss','yeni-ana-'+tema+'.png')});
    if(tema==='light'){
      await p.evaluate(()=>openKonu(1));
      await p.waitForTimeout(600);
      await p.screenshot({path:path.join(kok,'icerik','ss','yeni-konu1.png')});
      const r=await p.evaluate(()=>({ekran:curScreen,baslik:document.getElementById('konuAd').textContent,
        adim:document.querySelectorAll('.konu-adim').length,govde:document.getElementById('konuGovde').innerHTML.length}));
      console.log('KONU 1:',JSON.stringify(r));
      await p.evaluate(()=>openKonuListe());
      await p.waitForTimeout(500);
      await p.screenshot({path:path.join(kok,'icerik','ss','yeni-konuliste.png')});
      console.log('LISTE satir:',await p.evaluate(()=>document.querySelectorAll('.konu-sat').length));
    }
    await ctx.close();
  }
  await b.close();
  console.log('HATA:',hatalar.length); hatalar.forEach(h=>console.log(' ',h));
})();
