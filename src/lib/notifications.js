import { LocalNotifications } from '@capacitor/local-notifications';

const locales = {
  en: {
    morningTitle: "Milvexa - Milk Log Reminder 🌅",
    morningBody: "Good morning! Record today's morning milk production data.",
    eveningTitle: "Milvexa - Milk Log Reminder 🌇",
    eveningBody: "Good evening! Record today's evening milk production data.",
    dailyTitle: "Milvexa - Daily Farm Check 🐄",
    dailyBody: "Remember to update cattle registers and account ledger logs today.",
    pregTitle: "Milvexa: Pregnancy Check 🩺",
    pregBody: (tag) => `Animal Tag: ${tag} is due for a pregnancy test (60 days from breeding).`,
    calvingTitle: "Milvexa: Expected Calving 🐮",
    calvingBody: (tag) => `Animal Tag: ${tag} expected calving/delivery date is today (280 days from breeding).`
  },
  hi: {
    morningTitle: "मिल्वेक्सा - दूध रिकॉर्ड रिमाइंडर 🌅",
    morningBody: "शुभ प्रभात! कृपया आज सुबह का दूध उत्पादन डेटा दर्ज करें।",
    eveningTitle: "मिल्वेक्सा - दूध रिकॉर्ड रिमाइंडर 🌇",
    eveningBody: "शुभ संध्या! कृपया आज शाम का दूध उत्पादन डेटा दर्ज करें।",
    dailyTitle: "मिल्वेक्सा - दैनिक फार्म जांच 🐄",
    dailyBody: "आज अपने पशु रजिस्टर और खाता बही लॉग को अपडेट करना न भूलें।",
    pregTitle: "मिल्वेक्सा: गर्भावस्था जांच 🩺",
    pregBody: (tag) => `पशु टैग: ${tag} की आज गर्भावस्था जांच होनी है (प्रजनन के 60 दिन बाद)।`,
    calvingTitle: "मिल्वेक्सा: संभावित प्रसव तिथि 🐮",
    calvingBody: (tag) => `पशु टैग: ${tag} की आज संभावित प्रसव/कैल्विंग तिथि है (प्रजनन के 280 दिन बाद)।`
  },
  gu: {
    morningTitle: "મિલ્વેક્સા - દૂધ રેકોર્ડ રીમાઇન્ડર 🌅",
    morningBody: "શુભ સવાર! કૃપા કરીને આજે સવારનું દૂધ ઉત્પાદન નોંધો.",
    eveningTitle: "મિલ્વેક્સા - દૂધ રેકોર્ડ રીમાઇન્ડર 🌇",
    eveningBody: "શુભ સાંજ! કૃપા કરીને આજે સાંજનું દૂધ ઉત્પાદન નોંધો.",
    dailyTitle: "મિલ્વેક્સા - દૈનિક ફાર્મ ચેક 🐄",
    dailyBody: "આજે તમારા પશુ રજીસ્ટર અને ખાતાવહી વ્યવહારો અપડેટ કરવાનું યાદ રાખો.",
    pregTitle: "મિલ્વેક્સા: ગર્ભાવસ્થા તપાસ 🩺",
    pregBody: (tag) => `પશુ ટેગ: ${tag} ની આજે ગર્ભાવસ્થા તપાસ કરવાની છે (સંવર્ધનના 60 દિવસ બાદ).`,
    calvingTitle: "મિલ્વેક્સા: સંભવિત પ્રસૂતિ 🐮",
    calvingBody: (tag) => `પશુ ટેગ: ${tag} ની આજે સંભવિત પ્રસૂતિ/ડિલિવરી તારીખ છે (સંવર્ધનના 280 દિવસ બાદ).`
  }
};

const getActiveLocale = () => {
  const lang = localStorage.getItem('i18nextLng') || 'en';
  const baseLang = lang.split('-')[0];
  return locales[baseLang] || locales.en;
};

export const requestNotificationPermission = async () => {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  } catch (e) {
    console.error('Notification permission check failed:', e);
  }
};

export const scheduleDailyReminders = async () => {
  try {
    // Clear old daily reminders first to avoid duplication
    const pending = await LocalNotifications.getPending();
    const dailyIds = [101, 102, 103];
    const toCancel = pending.notifications.filter(n => dailyIds.includes(n.id));
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }

    const loc = getActiveLocale();

    // Schedule daily recurring notifications in the selected language
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101,
          title: loc.morningTitle,
          body: loc.morningBody,
          schedule: {
            on: { hour: 8, minute: 30 },
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 102,
          title: loc.eveningTitle,
          body: loc.eveningBody,
          schedule: {
            on: { hour: 18, minute: 30 },
            repeats: true,
            allowWhileIdle: true
          }
        },
        {
          id: 103,
          title: loc.dailyTitle,
          body: loc.dailyBody,
          schedule: {
            on: { hour: 13, minute: 0 },
            repeats: true,
            allowWhileIdle: true
          }
        }
      ]
    });
    console.log('Daily recurring reminders registered successfully in current locale');
  } catch (err) {
    console.error('Error scheduling daily reminders:', err);
  }
};

export const scheduleBreedingReminders = async (animalTag, breedingDateString, breedingRecordId) => {
  try {
    const breedingDate = new Date(breedingDateString);
    if (isNaN(breedingDate.getTime())) return;

    // 1. Pregnancy Check Reminder: 60 days after breeding date
    const pregCheckDate = new Date(breedingDate.getTime() + 60 * 24 * 60 * 60 * 1000);
    pregCheckDate.setHours(9, 0, 0, 0); // 9:00 AM

    // 2. Expected Calving Reminder: 280 days after breeding date
    const calvingDate = new Date(breedingDate.getTime() + 280 * 24 * 60 * 60 * 1000);
    calvingDate.setHours(9, 0, 0, 0); // 9:00 AM

    const baseId = typeof breedingRecordId === 'number' 
      ? breedingRecordId 
      : Math.abs(hashCode(String(breedingRecordId))) % 1000000;

    const loc = getActiveLocale();
    const notifications = [];

    if (pregCheckDate > new Date()) {
      notifications.push({
        id: baseId * 2,
        title: loc.pregTitle,
        body: loc.pregBody(animalTag),
        schedule: {
          at: pregCheckDate,
          allowWhileIdle: true
        }
      });
    }

    if (calvingDate > new Date()) {
      notifications.push({
        id: baseId * 2 + 1,
        title: loc.calvingTitle,
        body: loc.calvingBody(animalTag),
        schedule: {
          at: calvingDate,
          allowWhileIdle: true
        }
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled breeding reminders in current locale for animal ${animalTag}`);
    }
  } catch (err) {
    console.error('Error scheduling breeding notifications:', err);
  }
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return hash;
}
