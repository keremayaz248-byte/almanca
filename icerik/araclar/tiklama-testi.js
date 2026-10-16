// Ana ekrandaki HER tiklanabilir seyi tek tek tikla, acilan ekrani ve hatayi raporla.
const { chromium } = require('playwright');
const path=require('path'); const kok=path.resolve(__dirname,'..','..');
const URL='file:///'+path.join(kok,'index.html').split(path.sep).join('/');
(async()=>{
  const b=await chromium.launch(); const sonuc=[]; const hatalar=[];
  // once ana ekrandaki tiklanabilirleri listele (Ek Calisma acik halde)
  const ctx0=await b.newContext({viewport:{width:390,height:844},locale:'tr-TR'});
  const p0=await ctx0.newPage();
  await p0.addInitScript(()=>{try{localStorage.setItem('almanca_login_skip','1')}catch(e){}});
  await p0.goto(URL); await p0.waitForTimeout(900);
  await p0.evaluate(()=>{const w=document.getElementById('ekWrap');if(w)w.style.display='block';});
  const hedefler=await p0.evaluate(()=>{
    const out=[];
    document.querySelectorAll('#homeScreen [onclick]').forEach(el=>{
      const t=(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,40);
      out.push({sec:el.getAttribute('onclick'), ad:t});
    });
    return out;
  });
  await ctx0.close();
  console.log('ANA EKRANDA '+hedefler.length+' TIKLANABILIR OGE\n');

  for(const h of hedefler){
    const ctx=await b.newContext({viewport:{width:390,height:844},locale:'tr-TR'});
    const p=await ctx.newPage(); const yerel=[];
    p.on('pageerror',e=>yerel.push('PAGEERROR: '+e.message));
    p.on('console',m=>{if(m.type()==='error')yerel.push('CONSOLE: '+m.text());});
    p.on('dialog',d=>d.dismiss().catch(()=>{}));
    await p.addInitScript(()=>{try{localStorage.setItem('almanca_login_skip','1')}catch(e){}});
    await p.goto(URL); await p.waitForTimeout(700);
    let ekran='?';
    try{
      await p.evaluate(kod=>{ new Function(kod)(); }, h.sec);
      await p.waitForTimeout(500);
      ekran=await p.evaluate(()=>{
        const gor=[...document.querySelectorAll('#mainEl > div')].filter(d=>getComputedStyle(d).display!=='none');
        return gor.length?gor[0].id:'(hicbiri)';
      });
    }catch(e){ yerel.push('TIKLAMA HATASI: '+e.message.slice(0,90)); }
    const bozuk=yerel.length>0 || ekran==='(hicbiri)';
    sonuc.push({ad:h.ad,sec:h.sec,ekran,bozuk,not:yerel[0]||''});
    if(bozuk) hatalar.push(h.ad+' → '+(yerel[0]||'ekran acilmadi'));
    await ctx.close();
  }
  await b.close();
  sonuc.forEach(r=>console.log((r.bozuk?'✗':'✓')+' '+r.ad.padEnd(38)+' → '+r.ekran+(r.not?'  ['+r.not.slice(0,70)+']':'')));
  console.log('\nBOZUK: '+hatalar.length+' / '+sonuc.length);
})();
