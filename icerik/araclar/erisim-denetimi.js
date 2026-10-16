// WCAG 2.1 AA denetimi: kontrast, dokunma hedefi, odak gostergesi, form etiketi.
const { chromium } = require('playwright');
const path=require('path'); const kok=path.resolve(__dirname,'..','..');
const URL='file:///'+path.join(kok,'index.html').split(path.sep).join('/');
const EKRANLAR=[['homeScreen',null],['konuScreen','openKonu(1)'],['horenScreen','startDinleme()'],
                ['lesenScreen','openLesen()'],['konuListScreen','openKonuListe()']];
(async()=>{
 const b=await chromium.launch();
 for(const tema of ['light','dark']){
  console.log('\n████ TEMA: '+tema.toUpperCase()+' ████');
  for(const [ekran,komut] of EKRANLAR){
   const ctx=await b.newContext({viewport:{width:390,height:844},locale:'tr-TR'});
   const p=await ctx.newPage();
   p.on('dialog',d=>d.accept().catch(()=>{}));
   await p.addInitScript(t=>{try{localStorage.setItem('almanca_tema',t);localStorage.setItem('almanca_login_skip','1')}catch(e){}},tema);
   await p.goto(URL); await p.waitForTimeout(800);
   if(komut){ try{ await p.evaluate(k=>new Function(k)(),komut); await p.waitForTimeout(700);}catch(e){} }
   const r=await p.evaluate(()=>{
    const L=c=>{const v=c.map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
    const P=s=>{const m=String(s).match(/\d+(\.\d+)?/g);return m?m.slice(0,3).map(Number):null};
    const A=s=>{const m=String(s).match(/rgba?\([^)]*\)/);if(!m)return 1;const p=String(s).match(/[\d.]+/g);return p&&p.length>3?+p[3]:1};
    const zemin=el=>{let n=el;while(n&&n!==document.documentElement){const bg=getComputedStyle(n).backgroundColor;if(A(bg)>0.1&&P(bg))return P(bg);n=n.parentElement}
      return P(getComputedStyle(document.body).backgroundColor)||[255,255,255]};
    const oran=(a,b)=>{const l1=L(a),l2=L(b);return ((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05))};
    const gorunur=el=>{const r=el.getBoundingClientRect();const st=getComputedStyle(el);
      return r.width>0&&r.height>0&&st.display!=='none'&&st.visibility!=='hidden'&&+st.opacity>0.05};
    const out={kontrast:[],hedef:[],odak:[],etiket:[]};
    // 1) KONTRAST — gorunur metin
    document.querySelectorAll('button,a,p,div,span,td,th,label,h1,h2,h3,small,b,li').forEach(el=>{
      if(!gorunur(el))return;
      const yazi=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
      if(!yazi||yazi.length<2)return;
      const st=getComputedStyle(el); const fg=P(st.color); if(!fg)return;
      const bg=zemin(el); const o=oran(fg,bg);
      const px=parseFloat(st.fontSize), kalin=+st.fontWeight>=700;
      const buyuk=px>=24||(px>=18.66&&kalin);
      const gerek=buyuk?3:4.5;
      if(o<gerek) out.kontrast.push({yazi:yazi.slice(0,42),oran:+o.toFixed(2),gerek,px:Math.round(px),
        sinif:(el.className||'').toString().slice(0,28)});
    });
    // 2) DOKUNMA HEDEFI — 44x44
    document.querySelectorAll('button,a,[onclick],input,.opt,.mode-card,.sinav-kart,.konu-sat').forEach(el=>{
      if(!gorunur(el))return;
      const r=el.getBoundingClientRect();
      if(r.width<44||r.height<44) out.hedef.push({ad:(el.textContent||'').trim().slice(0,30)||el.id||el.tagName,
        g:Math.round(r.width),y:Math.round(r.height),sinif:(el.className||'').toString().slice(0,28)});
    });
    // 3) ODAK GOSTERGESI
    const odaklanabilir=[...document.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(gorunur);
    out.odakSayisi=odaklanabilir.length;
    // tiklanabilir ama odaklanamayan (div onclick)
    out.odaklanamaz=[...document.querySelectorAll('[onclick]')].filter(el=>gorunur(el)&&
      !['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(el.tagName)&&!el.hasAttribute('tabindex'))
      .map(el=>(el.textContent||'').trim().slice(0,34)||el.className).slice(0,10);
    // 4) FORM ETIKETI
    document.querySelectorAll('input,textarea,select').forEach(el=>{
      if(!gorunur(el))return;
      const v=el.labels&&el.labels.length||el.getAttribute('aria-label')||el.getAttribute('placeholder');
      if(!v) out.etiket.push(el.id||el.name||el.tagName);
    });
    return out;
   });
   const say=o=>o.length;
   console.log(`\n── ${ekran}  kontrast:${say(r.kontrast)}  kucuk hedef:${say(r.hedef)}  odaklanamaz:${say(r.odaklanamaz)}  etiketsiz:${say(r.etiket)}`);
   r.kontrast.slice(0,6).forEach(x=>console.log(`   ✗ ${x.oran}:1 (gerek ${x.gerek}) ${x.px}px "${x.yazi}" .${x.sinif}`));
   r.hedef.slice(0,5).forEach(x=>console.log(`   ⬚ ${x.g}x${x.y} "${x.ad}" .${x.sinif}`));
   r.odaklanamaz.slice(0,4).forEach(x=>console.log(`   ⌨ odaklanamaz: "${x}"`));
   await ctx.close();
  }
 }
 await b.close();
})();
