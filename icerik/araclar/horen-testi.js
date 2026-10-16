const { chromium } = require('playwright');
const path=require('path'); const kok=path.resolve(__dirname,'..','..');
(async()=>{
  const b=await chromium.launch(); const h=[];
  const ctx=await b.newContext({viewport:{width:390,height:1100},locale:'tr-TR'});
  const p=await ctx.newPage();
  p.on('pageerror',e=>h.push('PAGEERROR: '+e.message));
  p.on('console',m=>{if(m.type()==='error')h.push('CONSOLE: '+m.text());});
  await p.addInitScript(()=>{try{localStorage.setItem('almanca_login_skip','1')}catch(e){}});
  await p.goto('file:///'+path.join(kok,'index.html').split(path.sep).join('/'));
  await p.waitForTimeout(1000);
  console.log('SORU BANKASI:', await p.evaluate(()=>({
    toplam:SINAV_HOREN.length,
    teil1:SINAV_HOREN.filter(q=>q.teil===1).length,
    teil2:SINAV_HOREN.filter(q=>q.teil===2).length,
    teil3:SINAV_HOREN.filter(q=>q.teil===3).length,
    ipucuEksik:SINAV_HOREN.filter(q=>!q.ip).length,
    sikHatasi:SINAV_HOREN.filter(q=>q.c>=q.o.length||q.c<0).length,
  })));
  await p.evaluate(()=>startDinleme());
  await p.waitForTimeout(700);
  console.log('EKRAN:', await p.evaluate(()=>({ekran:curScreen,soru:document.getElementById('horenSoru').textContent,
    sik:document.querySelectorAll('#horenOpts .opt').length,
    metinGizli:!document.getElementById('horenFb').className.includes('show')})));
  await p.screenshot({path:path.join(kok,'icerik','ss','horen-soru.png')});
  // dogru siki bul ve tikla
  await p.evaluate(()=>{const q=hQs[hIdx];document.querySelectorAll('#horenOpts .opt')[q.c].click();});
  await p.waitForTimeout(500);
  console.log('CEVAP SONRASI:', await p.evaluate(()=>({
    metinAcildi:document.getElementById('horenFb').className.includes('show'),
    transkriptVar:document.querySelector('.horen-metin')!==null,
    ipucuVar:document.querySelector('.horen-ipucu')!==null, dogru:hDogru})));
  await p.screenshot({path:path.join(kok,'icerik','ss','horen-cevap.png')});
  await b.close();
  console.log('HATA:',h.length); h.forEach(x=>console.log(' ',x));
})();
