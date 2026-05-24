const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'i18n.js');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split(/\r?\n/);
lines[939] = '      "feed_purchase": "પશુ આહાર ખરીદી",';
const cleanedContent = lines.join('\n');

const resourcesMatch = cleanedContent.match(/const\s+resources\s*=\s*([\s\S]+?);\s*(export|i18n|$)/);
const res = new Function('return ' + resourcesMatch[1])();
const en = res.en.translation;

console.log('--- HINDI MISSING ---');
const hiMissing = Object.keys(en).filter(k => !res.hi.translation[k]);
hiMissing.forEach(k => {
  console.log(`"${k}": "${en[k]}",`);
});

console.log('\n--- GUJARATI MISSING ---');
const guMissing = Object.keys(en).filter(k => !res.gu.translation[k]);
guMissing.forEach(k => {
  console.log(`"${k}": "${en[k]}",`);
});
