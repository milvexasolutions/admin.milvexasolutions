const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'i18n.js');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split(/\r?\n/);
// Replace corrupted line (index 939)
lines[939] = '      "feed_purchase": "પશુ આહાર ખરીદી",';
const cleanedContent = lines.join('\n');

const resourcesMatch = cleanedContent.match(/const\s+resources\s*=\s*([\s\S]+?);\s*(export|i18n|$)/);
if (!resourcesMatch) {
  console.log("Could not find resources object");
  process.exit(1);
}

try {
  const res = new Function('return ' + resourcesMatch[1])();
  
  // Hindi Missing
  res.hi.translation["next_payment"] = "अगला भुगतान";
  
  // Gujarati Missing
  const guMissing = {
    "fill": "ભરો",
    "next_payment": "આગામી ચુકવણી",
    "medicine_vet": "દવા/પશુ ચિકિત્સક",
    "sold_liters_to": "{{customer}} ને {{qty}} લીટર વેચ્યું",
    "milk_sale_at": "દૂધ વેચાણ: {{qty}}લી @ ₹{{price}}",
    "update_available": "નવું અપડેટ ઉપલબ્ધ છે! 🎉",
    "update_desc": "સંસ્કરણ {{version}} નવી સુવિધાઓ અને સુધારા લાવે છે. {{notes}}",
    "update_download": "અપડેટ ડાઉનલોડ કરો",
    "update_later": "પછી યાદ કરાવો",
    "app_version": "Milvexa {{version}} • સુરક્ષિત",
    "confirm_password": "પાસવર્ડ ફરીથી લખો",
    "passwords_not_match": "પાસવર્ડ મેળ ખાતા નથી",
    "pwd_min_length": "પાસવર્ડ ઓછામાં ઓછો 8 અક્ષરનો હોવો જોઈએ",
    "pwd_uppercase": "પાસવર્ડમાં ઓછામાં ઓછો એક કેપિટલ અક્ષર હોવો જોઈએ",
    "pwd_lowercase": "પાસવર્ડમાં ઓછામાં ઓછો એક નાનો અક્ષર હોવો જોઈએ",
    "pwd_number": "પાસવર્ડમાં ઓછામાં ઓછો એક આંકડો હોવો જોઈએ",
    "pwd_special": "પાસવર્ડમાં ઓછામાં ઓછો એક વિશેષ અક્ષર હોવો જોઈએ (@#$%&*!)",
    "pwd_no_repeat": "પાસવર્ડમાં પુનરાવર્તિત અક્ષરો ન હોવા જોઈએ (દા.ત. 1111)",
    "pwd_common": "આ પાસવર્ડ ખૂબ સામાન્ય અથવા સરળ છે",
    "resend_code": "કોડ ફરીથી મોકલો",
    "resend_code_in": "{{seconds}} સેકન્ડમાં કોડ ફરીથી મોકલો",
    "milk_management": "દૂધ વ્યવસ્થાપન",
    "dairy_management": "ડેરી વ્યવસ્થાપન",
    "doctor_management": "ડોક્ટર વ્યવસ્થાપન",
    "staff_management": "કર્મચારી વ્યવસ્થાપન",
    "supplier_management": "સપ્લાયર વ્યવસ્થાપન",
    "breeding_management": "સંવર્ધન વ્યવસ્થાપન",
    "finance_management": "નાણાકીય વ્યવસ્થાપન",
    "help_support": "મદદ અને સપોર્ટ",
    "add_dairy": "ડેરી ઉમેરો",
    "dairy_list": "ડેરી યાદી",
    "dairy_ledger": "ડેરી ખાતાવહી",
    "add_doctor": "ડોક્ટર ઉમેરો",
    "doctor_list": "ડોક્ટર યાદી",
    "doctor_ledger": "ડોક્ટર ખાતાવહી",
    "feed_purchase": "પશુ આહાર ખરીદી"
  };
  
  Object.assign(res.gu.translation, guMissing);
  
  // Re-serialize the resources object into the file
  const newResourcesStr = JSON.stringify(res, null, 2);
  const updatedContent = cleanedContent.replace(/const\s+resources\s*=\s*[\s\S]+?;\s*(export|i18n|$)/, `const resources = ${newResourcesStr};\n\n$1`);
  
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log("Successfully fixed and enriched src/i18n.js");
} catch (e) {
  console.error("Failed to parse and write resources:", e);
}
