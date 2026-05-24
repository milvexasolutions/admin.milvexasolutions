const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'src', 'i18n.js');
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Load translation cache
const cache = JSON.parse(fs.readFileSync('translated_strings_cache.json', 'utf8'));

// Parse the i18n file (fix line 940 if needed)
const lines = i18nContent.split(/\r?\n/);
// Check and fix line 940 if corrupted
if (lines[939] && lines[939].includes('���')) {
  lines[939] = '      "feed_purchase": "પશુ આહાર ખરીદી",';
}
i18nContent = lines.join('\n');

const resourcesMatch = i18nContent.match(/const\s+resources\s*=\s*([\s\S]+?);\s*(export|i18n)/);
if (!resourcesMatch) {
  console.error('Could not find resources object');
  process.exit(1);
}

let res;
try {
  res = new Function('return ' + resourcesMatch[1])();
} catch (e) {
  console.error('Failed to parse resources:', e.message);
  process.exit(1);
}

// Helper to create a clean i18n key from a string
function makeKey(str) {
  return str.trim().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .substring(0, 50);
}

// Inject translations from cache
let addedCount = 0;
for (const [original, translations] of Object.entries(cache)) {
  const key = makeKey(original);
  if (!key) continue;

  // Add to English if not present
  if (!res.en.translation[key]) {
    res.en.translation[key] = original;
    addedCount++;
  }
  // Add to Hindi
  if (translations.hi && !res.hi.translation[key]) {
    res.hi.translation[key] = translations.hi;
  }
  // Add to Gujarati
  if (translations.gu && !res.gu.translation[key]) {
    res.gu.translation[key] = translations.gu;
  }
  // Add to Marathi (use Hindi as fallback if no Marathi)
  if (!res.mr || !res.mr.translation) res.mr = { translation: {} };
  if (translations.hi && !res.mr.translation[key]) {
    res.mr.translation[key] = translations.hi; // Marathi fallback to Hindi
  }
}

console.log(`Added ${addedCount} new keys from cache to translations.`);

// Rebuild the file preserving imports and i18n.init
const newResourcesStr = JSON.stringify(res, null, 2);
const updatedContent = i18nContent.replace(
  /const\s+resources\s*=\s*[\s\S]+?;\s*(export|i18n)/,
  `const resources = ${newResourcesStr};\n\n$1`
);

fs.writeFileSync(i18nPath, updatedContent, 'utf8');
console.log('Successfully updated src/i18n.js with all translations!');

// Final count summary
const enKeys = Object.keys(res.en.translation).length;
const hiKeys = Object.keys(res.hi.translation).length;
const guKeys = Object.keys(res.gu.translation).length;
const mrKeys = Object.keys(res.mr.translation).length;
console.log(`Key counts -> EN: ${enKeys}, HI: ${hiKeys}, GU: ${guKeys}, MR: ${mrKeys}`);
