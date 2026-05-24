const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, '..', 'src', 'i18n.js');
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Use regex to locate resources object
const resourcesMatch = i18nContent.match(/const\s+resources\s*=\s*([\s\S]+?);\s*(export|i18n|$)/);
if (!resourcesMatch) {
  console.error('Could not find resources object in src/i18n.js');
  process.exit(1);
}

const res = new Function('return ' + resourcesMatch[1])();

const newTranslations = {
  animal_heat_register: {
    en: "Animal Heat Register",
    hi: "पशु मद (हीट) रजिस्टर",
    gu: "પશુ ગરમી રજીસ્ટર"
  },
  edit_heat_register: {
    en: "Edit Heat Register",
    hi: "हीट रजिस्टर संपादित करें",
    gu: "ગરમી રજીસ્ટર સુધારો"
  },
  animal_id_name: {
    en: "Animal ID / Name",
    hi: "पशु आईडी / नाम",
    gu: "પશુ આઈડી / નામ"
  },
  enter_animal_id_or_name: {
    en: "Enter Animal ID or Name",
    hi: "पशु आईडी या नाम दर्ज करें",
    gu: "પશુ આઈડી અથવા નામ દાખલ કરો"
  },
  heat_date: {
    en: "Heat Date",
    hi: "मद (हीट) की तारीख",
    gu: "ગરમીની તારીખ"
  },
  symptoms: {
    en: "Symptoms",
    hi: "लक्षण",
    gu: "લક્ષણો"
  },
  enter_symptoms: {
    en: "Enter Symptoms",
    hi: "लक्षण दर्ज करें",
    gu: "લક્ષણો દાખલ કરો"
  },
  service_type: {
    en: "Service Type",
    hi: "सेवा का प्रकार",
    gu: "સેવાનો પ્રકાર"
  },
  natural_mating: {
    en: "Natural Mating",
    hi: "प्राकृतिक समागम (नेचुरल)",
    gu: "કુદરતી સંવનન (નેચરલ)"
  },
  ai_doctor: {
    en: "AI (Doctor)",
    hi: "कृत्रिम गर्भाधान (डॉक्टर)",
    gu: "કૃત્રિમ ગર્ભાધાન (ડોક્ટર)"
  },
  bull_name_id: {
    en: "Bull Name / ID",
    hi: "सांड का नाम / आईडी",
    gu: "આખલાનું નામ / આઈડી"
  },
  enter_bull_name_id: {
    en: "Enter Bull Name / ID",
    hi: "सांड का नाम / आईडी दर्ज करें",
    gu: "આખલાનું નામ / આઈડી દાખલ કરો"
  },
  doctor_name: {
    en: "Doctor Name",
    hi: "डॉक्टर का नाम",
    gu: "ડોક્ટરનું નામ"
  },
  enter_doctor_name: {
    en: "Enter Doctor Name",
    hi: "डॉक्टर का नाम दर्ज करें",
    gu: "ડોક્ટરનું નામ દાખલ કરો"
  },
  semen_breed: {
    en: "Semen Breed",
    hi: "वीर्य नस्ल",
    gu: "વીર્યની નસ્લ"
  },
  select_breed: {
    en: "Select Breed",
    hi: "नस्ल चुनें",
    gu: "નસ્લ પસંદ કરો"
  },
  notes: {
    en: "Notes",
    hi: "टिप्पणियाँ (नोट)",
    gu: "નોંધો"
  },
  enter_notes: {
    en: "Enter Notes",
    hi: "नोट दर्ज करें",
    gu: "નોંધ દાખલ કરો"
  },
  cost_of_treatment: {
    en: "Cost of Treatment (₹)",
    hi: "इलाज का खर्च (₹)",
    gu: "સારવારનો kharch (₹)"
  },
  enter_cost: {
    en: "Enter Cost",
    hi: "खर्च दर्ज करें",
    gu: "ખર્ચ દાખલ કરો"
  },
  submitting: {
    en: "Submitting...",
    hi: "जमा किया जा रहा है...",
    gu: "સબમિટ થઈ રહ્યું છે..."
  },
  submit: {
    en: "Submit",
    hi: "जमा करें",
    gu: "સબમિટ કરો"
  },
  status: {
    en: "Status",
    hi: "स्थिति",
    gu: "સ્થિતિ"
  },
  pending: {
    en: "Pending",
    hi: "लंबित",
    gu: "બાકી"
  },
  success: {
    en: "Success",
    hi: "सफल",
    gu: "સફળ"
  },
  failed: {
    en: "Failed",
    hi: "असफल",
    gu: "નિષ્ફળ"
  },
  delivered: {
    en: "Delivered",
    hi: "प्रसव हुआ",
    gu: "પ્રસૂતિ થઈ"
  },
  pregnant: {
    en: "Pregnant",
    hi: "गर्भवती",
    gu: "ગાભણ"
  },
  breeding_history: {
    en: "Heat Register History",
    hi: "मद (हीट) इतिहास",
    gu: "ગરમીનો ઇતિહાસ"
  },
  unknown_cow: {
    en: "Unknown Cow",
    hi: "अज्ञात गाय",
    gu: "અજ્ઞાત ગાય"
  },
  tag: {
    en: "Tag",
    hi: "टैग",
    gu: "ટેગ"
  },
  breeding: {
    en: "Breeding",
    hi: "संवर्धन",
    gu: "સંવર્ધન"
  },
  bull_details: {
    en: "Bull Details",
    hi: "सांड का विवरण",
    gu: "આખલાની વિગતો"
  },
  doctor: {
    en: "Doctor",
    hi: "डॉक्टर",
    gu: "ડોક્ટર"
  },
  symptoms_label: {
    en: "Symptoms",
    hi: "लक्षण",
    gu: "લક્ષણો"
  },
  cost_label: {
    en: "Cost",
    hi: "खर्च",
    gu: "ખર્ચ"
  },
  note_label: {
    en: "Note",
    hi: "नोट",
    gu: "નોંધ"
  },
  no_breeding_records: {
    en: "No Heat Register Records",
    hi: "कोई हीट रजिस्टर रिकॉर्ड नहीं मिला",
    gu: "કોઈ ગરમી રજીસ્ટર રેકોર્ડ મળ્યો નથી"
  },
  breeding_desc: {
    en: "Keep track of inseminations and pregnancy status.",
    hi: "गर्भाधान और गर्भावस्था की स्थिति का ट्रैक रखें।",
    gu: "ગર્ભાધાન અને ગર્ભાવસ્થાની સ્થિતિનો ટ્રૅક રાખો."
  },
  add_record: {
    en: "Add Record",
    hi: "रिकॉर्ड जोड़ें",
    gu: "રેકોર્ડ ઉમેરો"
  },
  edit: {
    en: "Edit",
    hi: "संपादित करें",
    gu: "સુધારો"
  },
  delete: {
    en: "Delete",
    hi: "हटाएं",
    gu: "કાઢી નાખો"
  },
  edit_worker: {
    en: "Edit Worker",
    hi: "कर्मचारी संपादित करें",
    gu: "કર્મચારી સુધારો"
  },
  eg_200: {
    en: "e.g. 2.0.0",
    hi: "जैसे: 2.0.0",
    gu: "દા.ત. 2.0.0"
  },
  breeding_record_added_successfully: {
    en: "Heat record added successfully!",
    hi: "मद (हीट) रिकॉर्ड सफलतापूर्वक जोड़ा गया!",
    gu: "ગરમી રેકોર્ડ સફળતાપૂર્વક ઉમેરવામાં આવ્યો!"
  },
  breeding_record_updated_successfully: {
    en: "Heat record updated successfully!",
    hi: "मद (हीट) रिकॉर्ड सफलतापूर्वक अपडेट किया गया!",
    gu: "ગરમી રેકોર્ડ સફળતાપૂર્વક અપડેટ કરવામાં આવ્યો!"
  },
  error_prefix: {
    en: "Error: ",
    hi: "त्रुटि: ",
    gu: "ભૂલ: "
  },
  confirm_delete_breeding: {
    en: "Are you sure you want to delete this heat record?",
    hi: "क्या आप वाकई इस मद (हीट) रिकॉर्ड को हटाना चाहते हैं?",
    gu: "શું તમે ખરેખર આ ગરમી રેકોર્ડ કાઢી નાખવા માંગો છો?"
  },
  record_deleted_successfully: {
    en: "Record deleted successfully",
    hi: "रिकॉर्ड सफलतापूर्वक हटा दिया गया",
    gu: "રેકોર્ડ સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો"
  },
  error_deleting_record: {
    en: "Error deleting record",
    hi: "रिकॉर्ड हटाने में त्रुटि",
    gu: "રેકોર્ડ કાઢી નાખવામાં ભૂલ"
  }
};

// Merge translations
for (const [key, langs] of Object.entries(newTranslations)) {
  res.en.translation[key] = langs.en;
  res.hi.translation[key] = langs.hi;
  res.gu.translation[key] = langs.gu;
}

const newResourcesStr = JSON.stringify(res, null, 2);
const updatedContent = i18nContent.replace(
  /const\s+resources\s*=\s*[\s\S]+?;\s*(export|i18n|$)/,
  `const resources = ${newResourcesStr};\n\n$1`
);

fs.writeFileSync(i18nPath, updatedContent, 'utf8');
console.log('Successfully injected breeding translations.');
