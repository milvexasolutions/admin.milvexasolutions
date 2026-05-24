const fs = require('fs');
const path = require('path');

const inputPath = 'filtered_strings.json';
const outputPath = 'translated_strings_cache.json';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Pre-defined manual translations for common terms to ensure 100% correct terms
const fallbackDict = {
  "hi": {
    "add_new_animal": "नया पशु जोड़ें",
    "basic_information": "बुनियादी जानकारी",
    "animal_category": "पशु श्रेणी",
    "animal_id": "पशु आईडी",
    "tag_id": "टैग आईडी",
    "breed": "नस्ल",
    "milking_status": "दूध देने की स्थिति",
    "animal_status_health": "पशु स्थिति (स्वास्थ्य)",
    "purchase_details": "खरीद विवरण",
    "purchase_price": "खरीद मूल्य",
    "purchase_date": "खरीद तिथि",
    "save_animal_record": "पशु रिकॉर्ड सहेजें",
    "adding_animal": "पशु जोड़ा जा रहा है...",
    "animal_added_successfully": "पशु सफलतापूर्वक जोड़ा गया!",
    "error_adding_animal": "पशु जोड़ने में त्रुटि:",
    "actions": "कार्रवाई",
    "active": "सक्रिय",
    "amount": "राशि",
    "balance": "शेष राशि",
    "date": "तिथि",
    "delete": "हटाएं",
    "edit": "संपादित करें",
    "save": "सहेजें",
    "cancel": "रद्द करें",
    "search": "खोजें...",
    "loading": "लोड हो रहा है...",
    "status": "स्थिति",
    "type": "प्रकार"
  },
  "gu": {
    "add_new_animal": "નવું પશુ ઉમેરો",
    "basic_information": "મૂળભૂત માહિતી",
    "animal_category": "પશુ શ્રેણી",
    "animal_id": "પશુ આઈડી",
    "tag_id": "ટેગ આઈડી",
    "breed": "નસ્લ",
    "milking_status": "દૂધ આપવાની સ્થિતિ",
    "animal_status_health": "પશુ સ્થિતિ (આરોગ્ય)",
    "purchase_details": "ખરીદી વિગતો",
    "purchase_price": "ખરીદી કિંમત",
    "purchase_date": "ખરીદી તારીખ",
    "save_animal_record": "પશુ રેકોર્ડ સાચવો",
    "adding_animal": "પશુ ઉમેરવામાં આવી રહ્યું છે...",
    "animal_added_successfully": "પશુ સફળતાપૂર્વક ઉમેરવામાં આવ્યું!",
    "error_adding_animal": "પશુ ઉમેરવામાં ભૂલ:",
    "actions": "કાર્યવાહી",
    "active": "સક્રિય",
    "amount": "રકમ",
    "balance": "બાકી રકમ",
    "date": "તારીખ",
    "delete": "કાઢી નાખો",
    "edit": "સુધારો",
    "save": "સાચવો",
    "cancel": "રદ કરો",
    "search": "શોધો...",
    "loading": "લોડ થઈ રહ્યું છે...",
    "status": "સ્થિતિ",
    "type": "પ્રકાર"
  }
};

let cache = {};
if (fs.existsSync(outputPath)) {
  cache = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
}

async function fetchTranslation(text, lang) {
  const normalizedKey = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  
  // 1. Check fallback dict first
  if (fallbackDict[lang] && fallbackDict[lang][normalizedKey]) {
    return fallbackDict[lang][normalizedKey];
  }

  // 2. Check cache
  if (cache[text] && cache[text][lang]) {
    return cache[text][lang];
  }

  const langCode = lang === 'hi' ? 'hi-IN' : 'gu-IN';
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    let translated = data.responseData.translatedText;
    
    // Check if there is a better match in the list that contains the target script
    const scriptRegex = lang === 'hi' ? /[\u0900-\u097F]/ : /[\u0A80-\u0AFF]/;
    
    if (data.matches && data.matches.length > 0) {
      for (const m of data.matches) {
        if (scriptRegex.test(m.translation)) {
          translated = m.translation;
          break;
        }
      }
    }

    // If it's still containing raw html or weird tokens, clean it
    translated = translated.replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    console.log(`Translated [${text}] to [${lang}]: [${translated}]`);
    return translated;
  } catch (e) {
    console.error(`Failed to translate [${text}] to [${lang}]:`, e.message);
    return null;
  }
}

async function start() {
  const strings = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Loaded ${strings.length} strings to translate.`);

  let count = 0;
  for (const item of strings) {
    const text = item.string;
    if (!cache[text]) {
      cache[text] = {};
    }

    if (!cache[text].hi) {
      const transHi = await fetchTranslation(text, 'hi');
      if (transHi) {
        cache[text].hi = transHi;
        fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2), 'utf8');
      }
      await delay(200); // 200ms delay between requests to be polite
    }

    if (!cache[text].gu) {
      const transGu = await fetchTranslation(text, 'gu');
      if (transGu) {
        cache[text].gu = transGu;
        fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2), 'utf8');
      }
      await delay(200);
    }

    count++;
    if (count % 10 === 0) {
      console.log(`Progress: ${count}/${strings.length} processed.`);
    }
  }

  console.log('All translations completed!');
}

start();
