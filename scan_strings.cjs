const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const uniqueStrings = new Set();

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Match JSX text: >Text Here< or > Text Here <
  const jsxTextRegex = />\s*([A-Za-z0-9][A-Za-z0-9\s.,?!:()'₹&-]*[A-Za-z0-9.,?!:()'₹&-]+)\s*</g;
  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 1 && isNaN(text)) {
      uniqueStrings.add(text);
    }
  }
  
  // 2. Match attribute values: placeholder="...", label="...", title="..."
  const attrRegex = /\b(placeholder|label|title|buttonText)\s*=\s*(['"])([^'"]+)\2/g;
  while ((match = attrRegex.exec(content)) !== null) {
    const text = match[3].trim();
    if (text && text.length > 1 && isNaN(text)) {
      uniqueStrings.add(text);
    }
  }

  // 3. Match alerts and confirms
  const jsMsgRegex = /\b(alert|confirm)\(\s*(['"])([^'"]+)\2/g;
  while ((match = jsMsgRegex.exec(content)) !== null) {
    const text = match[3].trim();
    if (text && text.length > 1 && isNaN(text)) {
      uniqueStrings.add(text);
    }
  }
}

walkDir(srcDir);

const sortedStrings = Array.from(uniqueStrings).sort();
fs.writeFileSync('extracted_strings.json', JSON.stringify(sortedStrings, null, 2), 'utf8');
console.log(`Extracted ${sortedStrings.length} unique strings.`);
