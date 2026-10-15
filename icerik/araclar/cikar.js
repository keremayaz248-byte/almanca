// PDF'ten sayfa numarali metin cikarir.
// Kullanim: node cikar.js <girdi.pdf> <cikti.txt>
const pdfParse = require('pdf-parse');
const fs = require('fs');

const inFile = process.argv[2];
const outFile = process.argv[3];

let page = 0;
const pages = [];

function render(pageData) {
  page += 1;
  const myPage = page;
  return pageData.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
    .then(tc => {
      let lastY = null;
      let text = '';
      for (const item of tc.items) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 1) text += '\n';
        text += item.str;
        lastY = y;
      }
      pages[myPage] = text;
      return '';
    });
}

pdfParse(fs.readFileSync(inFile), { pagerender: render })
  .then(data => {
    let out = '';
    for (let i = 1; i <= data.numpages; i++) {
      out += '\n===== SAYFA ' + i + ' =====\n';
      out += (pages[i] || '').replace(/\n{3,}/g, '\n\n');
    }
    fs.writeFileSync(outFile, out, 'utf8');
    console.log('OK ' + inFile + ' -> ' + outFile + ' | sayfa: ' + data.numpages + ' | karakter: ' + out.length);
  })
  .catch(e => { console.error('HATA ' + inFile + ': ' + e.message); process.exit(1); });
