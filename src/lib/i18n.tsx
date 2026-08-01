import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "te" | "ur";

export const languages: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

const STORAGE_KEY = "mem-lang";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.resources": "Islamic Resources",
  "nav.prayerTimes": "Prayer Times",
  "nav.announcements": "Announcements",
  "nav.about": "About",
  "nav.admin": "Admin",
  "hero.subtitle": "A place of worship, peace, learning and community.",
  "hero.cta": "View Prayer Times",
  "hero.cta2": "Islamic Resources",
  "prayer.title": "Prayer Times",
  "prayer.eyebrow": "Today's Timetable",
  "prayer.desc":
    "Timings are shown in 24-hour format. Please arrive a few minutes early to make your rows straight.",
  "prayer.fajr": "Fajr",
  "prayer.sunrise": "Sunrise",
  "prayer.dhuhr": "Dhuhr",
  "prayer.asr": "Asr",
  "prayer.maghrib": "Maghrib",
  "prayer.isha": "Isha",
  "prayer.jumuah": "Jumu'ah",
  "prayer.today": "Today",
  "prayer.hijri": "Hijri Date",
  "prayer.clock": "Live Clock",
  "ann.title": "Masjid Announcements",
  "ann.eyebrow": "Latest Updates",
  "ann.desc": "Notices and updates from the masjid administration.",
  "ann.empty": "No announcements at the moment.",
  "about.title": "About the Masjid",
  "about.eyebrow": "Our Masjid",
  "about.contact": "Contact Information",
  "about.address": "Address",
  "about.phone": "Phone",
  "about.email": "Email",
  "about.map": "Find Us",
  "about.openMap": "Open in Google Maps",
  "about.more": "More About Us",
  "about.readMore": "Read More",
  "about.close": "Close",
  "loc.title": "Location",
  "loc.eyebrow": "Find the Masjid",
  "loc.desc": "Visit us for the five daily prayers and the weekly Jumu'ah khutbah.",
  "loc.directions": "Get Directions",
  "contact.title": "Contact",
  "contact.eyebrow": "Get in Touch",
  "contact.desc": "Reach the masjid office by phone, WhatsApp or email.",
  "contact.whatsapp": "WhatsApp",
  "contact.website": "Website",
  "contact.facebook": "Facebook",
  "contact.instagram": "Instagram",
  "contact.youtube": "YouTube",
  "contact.social": "Stay Connected",
  "quran.fullscreen": "Fullscreen",
  "quran.search": "Search in PDF",
  "quran.searchPlaceholder": "Search a word or phrase",
  "footer.quick": "Quick Links",
  "loading": "Loading",
  "res.title": "Islamic Resources",
  "res.eyebrow": "Learn & Reflect",
  "res.desc": "Daily reminders from the Quran and Sunnah, and the basics of our faith.",
  "res.verse": "Daily Quran Verse",
  "res.hadith": "Daily Hadith",
  "res.basics": "Basics of Islam",
  "res.quran": "Quran PDF Viewer",
  "quran.prev": "Previous Page",
  "quran.next": "Next Page",
  "quran.zoomIn": "Zoom In",
  "quran.zoomOut": "Zoom Out",
  "quran.download": "Download Quran PDF",
  "quran.page": "Page",
  "quran.missing": "No Quran PDF has been uploaded yet.",
  "admin.title": "Admin Panel",
  "admin.login": "Admin Login",
  "admin.username": "Username",
  "admin.password": "Password",
  "admin.signIn": "Sign In",
  "admin.signOut": "Sign Out",
  "admin.wrong": "Incorrect username or password.",
  "admin.save": "Save Changes",
  "admin.cancel": "Cancel",
  "admin.reset": "Reset Changes",
  "admin.resetDone": "Content reset to the defaults.",
  "admin.branding": "Branding",
  "admin.logo": "Website Logo",
  "admin.hero": "Hero Background Image",
  "admin.saved": "Changes saved and live on the website.",
  "admin.hint": "Restricted area for the Imam and masjid administration.",
  "basics.1.title": "Tawheed — Oneness of Allah",
  "basics.1.body":
    "The foundation of Islam is to believe that Allah alone is worthy of worship, without partner or equal.",
  "basics.2.title": "The Five Pillars",
  "basics.2.body":
    "Shahadah (faith), Salah (prayer), Zakah (charity), Sawm (fasting in Ramadan) and Hajj (pilgrimage).",
  "basics.3.title": "Salah — The Daily Prayers",
  "basics.3.body":
    "Five prayers each day keep the heart connected to Allah: Fajr, Dhuhr, Asr, Maghrib and Isha.",
  "basics.4.title": "Akhlaq — Good Character",
  "basics.4.body":
    "The Prophet ﷺ was sent to perfect good character: honesty, mercy, patience and kindness to all.",
  "footer.tagline":
    "A place of worship, peace, learning and community — open to everyone, every day of the year.",
  "footer.explore": "Explore",
  "footer.visit": "Visit Us",
  "footer.rights": "All rights reserved.",
};

const te: Dict = {
  ...en,
  "nav.home": "హోమ్",
  "nav.resources": "ఇస్లామిక్ వనరులు",
  "nav.prayerTimes": "నమాజ్ సమయాలు",
  "nav.announcements": "ప్రకటనలు",
  "nav.about": "మా గురించి",
  "nav.admin": "అడ్మిన్",
  "hero.subtitle": "ఆరాధన, శాంతి, విద్య మరియు సమాజం కోసం ఒక ప్రదేశం.",
  "hero.cta": "నమాజ్ సమయాలు చూడండి",
  "hero.cta2": "ఇస్లామిక్ వనరులు",
  "prayer.title": "నమాజ్ సమయాలు",
  "prayer.eyebrow": "నేటి సమయ పట్టిక",
  "prayer.desc": "సమయాలు 24-గంటల ఫార్మాట్‌లో ఉన్నాయి. కొన్ని నిమిషాలు ముందుగా రావండి.",
  "prayer.fajr": "ఫజ్ర్",
  "prayer.sunrise": "సూర్యోదయం",
  "prayer.dhuhr": "జొహర్",
  "prayer.asr": "అస్ర్",
  "prayer.maghrib": "మగ్రిబ్",
  "prayer.isha": "ఇషా",
  "prayer.jumuah": "జుమా",
  "prayer.today": "నేడు",
  "prayer.hijri": "హిజ్రీ తేదీ",
  "prayer.clock": "ప్రత్యక్ష గడియారం",
  "ann.title": "మస్జిద్ ప్రకటనలు",
  "ann.eyebrow": "తాజా సమాచారం",
  "ann.desc": "మస్జిద్ నిర్వహణ నుండి ప్రకటనలు మరియు నవీకరణలు.",
  "ann.empty": "ప్రస్తుతం ప్రకటనలు లేవు.",
  "about.title": "మస్జిద్ గురించి",
  "about.eyebrow": "మా మస్జిద్",
  "about.contact": "సంప్రదింపు వివరాలు",
  "about.address": "చిరునామా",
  "about.phone": "ఫోన్",
  "about.email": "ఇమెయిల్",
  "about.map": "మమ్మల్ని కనుగొనండి",
  "about.openMap": "గూగుల్ మ్యాప్స్‌లో తెరవండి",
  "about.readMore": "మరింత చదవండి",
  "about.close": "మూసివేయండి",
  "quran.search": "PDF లో వెతకండి",
  "quran.searchPlaceholder": "పదం లేదా వాక్యం వెతకండి",
  "quran.fullscreen": "పూర్తి తెర",
  "res.title": "ఇస్లామిక్ వనరులు",
  "res.eyebrow": "నేర్చుకోండి & ఆలోచించండి",
  "res.desc": "ఖురాన్ మరియు సున్నత్ నుండి రోజువారీ జ్ఞాపికలు, ఇస్లాం ప్రాథమికాలు.",
  "res.verse": "నేటి ఖురాన్ వాక్యం",
  "res.hadith": "నేటి హదీస్",
  "res.basics": "ఇస్లాం ప్రాథమికాలు",
  "res.quran": "ఖురాన్ PDF వ్యూయర్",
  "quran.prev": "మునుపటి పేజీ",
  "quran.next": "తదుపరి పేజీ",
  "quran.zoomIn": "జూమ్ ఇన్",
  "quran.zoomOut": "జూమ్ అవుట్",
  "quran.download": "ఖురాన్ PDF డౌన్‌లోడ్",
  "quran.page": "పేజీ",
  "quran.missing": "ఇంకా ఖురాన్ PDF అప్‌లోడ్ చేయలేదు.",
  "basics.1.title": "తౌహీద్ — అల్లాహ్ ఏకత్వం",
  "basics.1.body": "ఆరాధనకు అర్హుడు అల్లాహ్ ఒక్కడే అని విశ్వసించడం ఇస్లాం పునాది.",
  "basics.2.title": "ఐదు మూల స్తంభాలు",
  "basics.2.body": "షహాదా, నమాజ్, జకాత్, రోజా మరియు హజ్.",
  "basics.3.title": "నమాజ్ — రోజువారీ ప్రార్థనలు",
  "basics.3.body": "ఫజ్ర్, జొహర్, అస్ర్, మగ్రిబ్ మరియు ఇషా — ఐదు నమాజులు హృదయాన్ని అల్లాహ్‌తో కలుపుతాయి.",
  "basics.4.title": "అఖ్లాఖ్ — మంచి నడవడిక",
  "basics.4.body": "నిజాయితీ, కరుణ, ఓపిక మరియు దయ — ప్రవక్త ﷺ బోధించిన సద్గుణాలు.",
  "footer.tagline": "ఆరాధన, శాంతి, విద్య మరియు సమాజం కోసం ఒక ప్రదేశం — అందరికీ స్వాగతం.",
  "footer.explore": "అన్వేషించండి",
  "footer.visit": "మమ్మల్ని సందర్శించండి",
  "footer.rights": "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",
};

const ur: Dict = {
  ...en,
  "nav.home": "ہوم",
  "nav.resources": "اسلامی وسائل",
  "nav.prayerTimes": "نماز کے اوقات",
  "nav.announcements": "اعلانات",
  "nav.about": "تعارف",
  "nav.admin": "ایڈمن",
  "hero.subtitle": "عبادت، سکون، علم اور برادری کی جگہ۔",
  "hero.cta": "نماز کے اوقات دیکھیں",
  "hero.cta2": "اسلامی وسائل",
  "prayer.title": "نماز کے اوقات",
  "prayer.eyebrow": "آج کا نظام الاوقات",
  "prayer.desc": "اوقات 24 گھنٹے کے فارمیٹ میں ہیں۔ براہ کرم چند منٹ پہلے تشریف لائیں۔",
  "prayer.fajr": "فجر",
  "prayer.sunrise": "طلوعِ آفتاب",
  "prayer.dhuhr": "ظہر",
  "prayer.asr": "عصر",
  "prayer.maghrib": "مغرب",
  "prayer.isha": "عشاء",
  "prayer.jumuah": "جمعہ",
  "prayer.today": "آج",
  "prayer.hijri": "ہجری تاریخ",
  "prayer.clock": "براہِ راست وقت",
  "ann.title": "مسجد کے اعلانات",
  "ann.eyebrow": "تازہ اطلاعات",
  "ann.desc": "انتظامیہ کی جانب سے اطلاعات اور اعلانات۔",
  "ann.empty": "اس وقت کوئی اعلان نہیں ہے۔",
  "about.title": "مسجد کے بارے میں",
  "about.eyebrow": "ہماری مسجد",
  "about.contact": "رابطہ کی معلومات",
  "about.address": "پتہ",
  "about.phone": "فون",
  "about.email": "ای میل",
  "about.map": "ہمیں تلاش کریں",
  "about.openMap": "گوگل میپس میں کھولیں",
  "res.title": "اسلامی وسائل",
  "res.eyebrow": "سیکھیں اور غور کریں",
  "res.desc": "قرآن و سنت سے روزانہ کی یاد دہانیاں اور دینِ اسلام کے بنیادی اصول۔",
  "res.verse": "آج کی قرآنی آیت",
  "res.hadith": "آج کی حدیث",
  "res.basics": "اسلام کے بنیادی اصول",
  "res.quran": "قرآن پی ڈی ایف ریڈر",
  "quran.prev": "پچھلا صفحہ",
  "quran.next": "اگلا صفحہ",
  "quran.zoomIn": "زوم اِن",
  "quran.zoomOut": "زوم آؤٹ",
  "quran.download": "قرآن پی ڈی ایف ڈاؤن لوڈ",
  "quran.page": "صفحہ",
  "quran.missing": "ابھی تک کوئی قرآن پی ڈی ایف اپ لوڈ نہیں ہوئی۔",
  "basics.1.title": "توحید — اللہ کی وحدانیت",
  "basics.1.body": "اسلام کی بنیاد یہ ہے کہ عبادت کے لائق صرف اللہ ہی ہے، اس کا کوئی شریک نہیں۔",
  "basics.2.title": "پانچ ارکان",
  "basics.2.body": "شہادت، نماز، زکوٰۃ، روزہ اور حج۔",
  "basics.3.title": "نماز — روزانہ کی عبادت",
  "basics.3.body": "فجر، ظہر، عصر، مغرب اور عشاء دل کو اللہ سے جوڑے رکھتی ہیں۔",
  "basics.4.title": "اخلاق — حسنِ سلوک",
  "basics.4.body": "سچائی، رحم، صبر اور نرمی — نبی ﷺ کی تعلیمات کا خاصہ۔",
  "footer.tagline": "عبادت، سکون، علم اور برادری کی جگہ — سب کے لیے ہر روز کھلی۔",
  "footer.explore": "دریافت کریں",
  "footer.visit": "ہم سے ملیں",
  "footer.rights": "جملہ حقوق محفوظ ہیں۔",
};

const dictionaries: Record<Lang, Dict> = { en, te, ur };

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => en[k] ?? k,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && stored in dictionaries) setLangState(stored);
  }, []);

  const dir: "ltr" | "rtl" = lang === "ur" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback((key: string) => dictionaries[lang][key] ?? en[key] ?? key, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>{children}</I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);