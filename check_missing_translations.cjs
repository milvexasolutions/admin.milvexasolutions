const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n.js');
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Clean line 940 replacement for parsing
const lines = i18nContent.split(/\r?\n/);
lines[939] = '      "feed_purchase": "પશુ આહાર ખરીદી",';
i18nContent = lines.join('\n');

const resourcesMatch = i18nContent.match(/const\s+resources\s*=\s*([\s\S]+?);\s*(export|i18n|$)/);
const res = new Function('return ' + resourcesMatch[1])();
const enDict = res.en.translation;
const hiDict = res.hi.translation;
const guDict = res.gu.translation;

const extracted = JSON.parse(fs.readFileSync('extracted_strings.json', 'utf8'));
const untranslated = [];

extracted.forEach(str => {
  const key = str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (!key) return;

  const inEn = enDict[key];
  const inHi = hiDict[key];
  const inGu = guDict[key];

  if (!inEn || !inHi || !inGu) {
    untranslated.push({
      string: str,
      key: key,
      missingIn: {
        en: !inEn,
        hi: !inHi,
        gu: !inGu
      }
    });
  }
});

fs.writeFileSync('untranslated_strings.json', JSON.stringify(untranslated, null, 2), 'utf8');
console.log(`Out of ${extracted.length} extracted strings, ${untranslated.length} are missing translations.`);
