// icerik/hazir/konu-<no>.json dosyalarini index.html'e gomer (statik, calisma zamaninda dis baglanti yok).
// Kullanim: node icerik/araclar/hazir-yerlestir.js           -> dogrular, sonra gomer
//           node icerik/araclar/hazir-yerlestir.js --kuru    -> yalniz ne gomulecegini yazar
// "_" ile baslayan dosyalar (bicim ornekleri) atlanir. Dogrulama (hazir-kontrol.js) gecmezse hicbir sey yazilmaz.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const kok = path.resolve(__dirname, '..', '..');
const klasor = path.join(kok, 'icerik', 'hazir');
const indexYol = path.join(kok, 'index.html');
const kuru = process.argv.includes('--kuru');

const dosyalar = fs.readdirSync(klasor).filter(f => /^konu-\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
if (!dosyalar.length) { console.log('Gomulecek konu-*.json yok.'); process.exit(0); }

const kontrol = spawnSync('node', [path.join(__dirname, 'hazir-kontrol.js'), ...dosyalar.map(f => path.join(klasor, f))], { encoding: 'utf8' });
if (kontrol.status !== 0) { console.log(kontrol.stdout); console.error('Dogrulama gecmedi; hicbir sey gomulmedi.'); process.exit(1); }

const nesne = {};
dosyalar.forEach(f => {
  const v = JSON.parse(fs.readFileSync(path.join(klasor, f), 'utf8'));
  nesne[v.konu] = { kaynak: v.kaynak, deste: v.deste, gramer: v.gramer };
});

// <script> icinde guvenli olsun: "</script" ve satir ayiricilari kacirilir (ters bolu icin kod 92 kullanilir)
const TB = String.fromCharCode(92);
const js = JSON.stringify(nesne)
  .replace(new RegExp('<' + '/(script)', 'gi'), (m, s) => '<' + TB + '/' + s)
  .split(String.fromCharCode(0x2028)).join(TB + 'u2028')
  .split(String.fromCharCode(0x2029)).join(TB + 'u2029');

const h = fs.readFileSync(indexYol, 'utf8');
const bas = '// <DERS_ICERIK>', son = '// </DERS_ICERIK>';
const i = h.indexOf(bas), j = h.indexOf(son);
if (i < 0 || j < i) { console.error('index.html icinde DERS_ICERIK isaretleri yok.'); process.exit(1); }
const yeni = h.slice(0, i) + bas + '\nconst DERS_ICERIK=' + js + ';\n' + h.slice(j);
console.log('Gomulecek konu:', Object.keys(nesne).join(', '), '| boyut:', Math.round(js.length / 1024) + ' KB');
if (kuru) { console.log('(--kuru: yazilmadi)'); process.exit(0); }
fs.writeFileSync(indexYol, yeni);

// sozdizimi guvencesi: bozulursa eski hale don
const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g; let m, all = '';
while ((m = re.exec(yeni))) all += m[1] + '\n;\n';
try { new Function(all); console.log('index.html sozdizimi tamam, gomuldu.'); }
catch (e) { fs.writeFileSync(indexYol, h); console.error('SOZDIZIMI HATASI, geri alindi:', e.message); process.exit(1); }
