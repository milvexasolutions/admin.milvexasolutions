const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'i18n.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the corrupted line 940 so we can parse it
content = content.replace(/"feed_purchase":\s*"[^"]*જર",/, '"feed_purchase": "પશુ આહાર ખરીદી",');

// Strip out imports to construct a valid object
const resourcesMatch = content.match(/const\s+resources\s*=\s*([\s\S]+?);\s*(export|i18n|$)/);
if (!resourcesMatch) {
  console.log("Could not find resources object");
  process.exit(1);
}

try {
  const res = new Function('return ' + resourcesMatch[1])();
  const enKeys = Object.keys(res.en.translation);
  console.log('Total English keys:', enKeys.length);
  
  ['hi', 'gu', 'mr'].forEach(lang => {
    if (!res[lang] || !res[lang].translation) {
      console.log(`${lang} language block is missing entirely!`);
      return;
    }
    const langKeys = Object.keys(res[lang].translation);
    const missing = enKeys.filter(k => !langKeys.includes(k));
    const extra = langKeys.filter(k => !enKeys.includes(k));
    console.log(`${lang}: keys count = ${langKeys.length}; missing = ${missing.length}; extra = ${extra.length}`);
    if (missing.length > 0) {
      console.log(`  Missing keys (first 20):`, missing.slice(0, 20));
    }
    if (extra.length > 0) {
      console.log(`  Extra keys (first 20):`, extra.slice(0, 20));
    }
  });
} catch (e) {
  console.error("Failed to parse resources:", e);
}
