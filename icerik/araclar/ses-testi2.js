// Almanca ses YOKKEN dinleme modu ne yapiyor? (kullanicinin telefonu gibi en kotu durum)
const { chromium } = require('playwright');
const path=require('path'); const kok=path.resolve(__dirname,'..','..');
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:1000},locale:'tr-TR'});
  const p=await ctx.newPage(); const h=[];
  p.on('pageerror',e=>h.push('PAGEERROR: '+e.message));
  p.on('console',m=>{if(m.type()==='error')h.push('CONSOLE: '+m.text());});
  let uyari=null;
  p.on('dialog',async d=>{ uyari=d.message().slice(0,80); await d.accept(); });
  await p.addInitScript(()=>{try{localStorage.setItem('almanca_login_skip','1')}catch(e){}});
  await p.goto('file:///'+path.join(kok,'index.html').split(path.sep).join('/'));
  await p.waitForTimeout(1000);
  await p.evaluate(()=>startDinleme());
  await p.waitForTimeout(3500);
  console.log('UYARI:', uyari||'(yok)');
  console.log('DURUM:', await p.evaluate(()=>({
    ekran:curScreen, sessizMod:HOREN_SESSIZ, soru:hQs.length,
    soruGorunur:document.getElementById('horenSoru').textContent.slice(0,40)})));
  // Dinle'ye bas — sessiz modda metin gelmeli
  await p.click('#horenPlay'); await p.waitForTimeout(2600);
  console.log('DINLE SONRASI:', await p.evaluate(()=>({
    metinGeldi:document.querySelector('#horenKez .horen-metin')!==null,
    yazi:document.getElementById('horenKez').textContent.slice(0,70)})));
  await p.screenshot({path:path.join(kok,'icerik','ss','horen-sessiz.png')});
  console.log('HATA:',h.length); h.forEach(x=>console.log(' ',x));
  await b.close();
})();
