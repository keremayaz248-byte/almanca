const { chromium } = require('playwright');
const path=require('path'); const kok='C:/Users/Administrator/Desktop/Almanca';
(async()=>{
  const b=await chromium.launch();
  for(const t of ['light','dark']){
    const ctx=await b.newContext({viewport:{width:390,height:1450},locale:'tr-TR'});
    const p=await ctx.newPage();
    await p.addInitScript(x=>{try{localStorage.setItem('almanca_tema',x);localStorage.setItem('almanca_login_skip','1')}catch(e){}},t);
    await p.goto('file:///'+kok+'/index.html'); await p.waitForTimeout(1100);
    await p.screenshot({path:kok+'/icerik/ss/duzen-'+t+'.png'});
    if(t==='light'){ await p.evaluate(()=>openLesen()); await p.waitForTimeout(600);
      await p.screenshot({path:kok+'/icerik/ss/lesen.png'});
      console.log('LESEN:',await p.evaluate(()=>({ekran:curScreen,soru:lQs.length,metin:document.querySelector('.lm-govde').textContent.slice(0,40)})));}
    await ctx.close();
  }
  await b.close();
})();
