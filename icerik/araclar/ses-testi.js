const { chromium } = require('playwright');
const path=require('path'); const kok=path.resolve(__dirname,'..','..');
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},locale:'tr-TR'});
  const p=await ctx.newPage();
  await p.addInitScript(()=>{try{localStorage.setItem('almanca_login_skip','1')}catch(e){}});
  await p.goto('file:///'+path.join(kok,'index.html').split(path.sep).join('/'));
  await p.waitForTimeout(1500);
  const r=await p.evaluate(async()=>{
    const out={api:'speechSynthesis' in window};
    if(!out.api) return out;
    // sesler asenkron yuklenebilir — bekle
    await new Promise(res=>{ let n=0;
      const t=setInterval(()=>{ if(window.speechSynthesis.getVoices().length||++n>10){clearInterval(t);res();} },200); });
    const v=window.speechSynthesis.getVoices();
    out.sesSayisi=v.length;
    out.almancaSes=v.filter(x=>/^de/i.test(x.lang)).map(x=>x.name+' ('+x.lang+')');
    out.bizimKontrol=almancaSesVar();
    // gercekten konusmayi dene
    out.konustu=await new Promise(res=>{
      try{
        const u=new SpeechSynthesisUtterance('Guten Tag');
        u.lang='de-DE'; let bitti=false;
        u.onstart=()=>{bitti=true;res('onstart tetiklendi')};
        u.onerror=e=>{bitti=true;res('HATA: '+e.error)};
        u.onend=()=>{if(!bitti)res('onend (onstart olmadan)')};
        window.speechSynthesis.speak(u);
        setTimeout(()=>{if(!bitti)res('SESSIZ — hicbir olay tetiklenmedi')},3000);
      }catch(e){res('ISTISNA: '+e.message)}
    });
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
