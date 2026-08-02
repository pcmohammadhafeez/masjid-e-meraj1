import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "./i18n";

/**
 * Site content store — backed entirely by the cloud database.
 *
 * Visitors read published content with the public (anon) key; only signed-in
 * admins can write. Nothing important is kept in localStorage, so the site
 * behaves identically on the Lovable preview, Vercel preview, Vercel
 * production and any custom domain.
 */

/** Bucket that holds every uploaded file (Quran PDF, logo, hero image). */
export const ASSET_BUCKET = "site-assets";

export type Multilingual = Record<Lang, string>;

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha" | "jumuah";

export type Announcement = {
  id: string;
  date: string;
  title: Multilingual;
  body: Multilingual;
};

export type BasicTopic = {
  id: string;
  icon: "pillars" | "faith" | "salah" | "wudu" | "ramadan" | "zakat" | "hajj";
  title: Multilingual;
  body: Multilingual;
};

export type MasjidLocation = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  mapsUrl: string;
};

export type ContactInfo = {
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
};

export type SiteContent = {
  prayerTimes: Record<PrayerKey, string>;
  jumuahKhutbah: string;
  announcements: Announcement[];
  /** Short card summary shown on the home page. */
  aboutSummary: Multilingual;
  /** Full description opened from the "Read More" dialog. */
  aboutFull: Multilingual;
  contact: ContactInfo;
  location: MasjidLocation;
  quranPdfUrl: string;
  quranPdfName: string;
  /** Raw storage path of the Quran PDF (empty when an external URL is used). */
  quranPdfPath: string;
  logoUrl: string;
  heroImageUrl: string;
  /** Raw storage paths for branding uploads. */
  logoPath: string;
  heroPath: string;
  dailyVerse: { reference: string; arabic: string; translation: Multilingual };
  dailyHadith: { source: string; arabic: string; text: Multilingual };
  basics: BasicTopic[];
};

export const emptyMultilingual: Multilingual = { en: "", te: "", ur: "" };

const basics: BasicTopic[] = [
  {
    id: "pillars",
    icon: "pillars",
    title: {
      en: "Five Pillars of Islam",
      te: "ఇస్లాం ఐదు మూల స్తంభాలు",
      ur: "اسلام کے پانچ ارکان",
    },
    body: {
      en: "Shahadah (faith), Salah (prayer), Zakat (charity), Sawm (fasting in Ramadan) and Hajj (pilgrimage).",
      te: "షహాదా (విశ్వాసం), నమాజ్, జకాత్ (దానం), రోజా (ఉపవాసం) మరియు హజ్ (యాత్ర).",
      ur: "شہادت، نماز، زکوٰۃ، روزہ اور حج۔",
    },
  },
  {
    id: "faith",
    icon: "faith",
    title: {
      en: "Six Articles of Faith",
      te: "విశ్వాసపు ఆరు మూలాంశాలు",
      ur: "ایمان کے چھ ارکان",
    },
    body: {
      en: "Belief in Allah, His angels, His books, His messengers, the Last Day and divine decree.",
      te: "అల్లాహ్, దైవదూతలు, గ్రంథాలు, ప్రవక్తలు, తీర్పు దినం మరియు దైవ నిర్ణయంపై విశ్వాసం.",
      ur: "اللہ، فرشتوں، کتابوں، رسولوں، آخرت اور تقدیر پر ایمان۔",
    },
  },
  {
    id: "wudu",
    icon: "wudu",
    title: { en: "How to Perform Wudu", te: "వుజూ ఎలా చేయాలి", ur: "وضو کیسے کریں" },
    body: {
      en: "Wash the hands, rinse the mouth and nose, wash the face and arms, wipe the head, then wash the feet.",
      te: "చేతులు, నోరు, ముక్కు కడిగి, ముఖం మరియు చేతులు కడిగి, తలపై తుడిచి, పాదాలు కడగాలి.",
      ur: "ہاتھ دھوئیں، کلی کریں، ناک صاف کریں، چہرہ اور بازو دھوئیں، سر کا مسح کریں، پھر پاؤں دھوئیں۔",
    },
  },
  {
    id: "salah",
    icon: "salah",
    title: { en: "How to Pray Salah", te: "నమాజ్ ఎలా చేయాలి", ur: "نماز کیسے پڑھیں" },
    body: {
      en: "Face the Qiblah, make the intention, then pray with takbir, recitation, ruku, sujud and tasleem.",
      te: "ఖిబ్లా వైపు తిరిగి, సంకల్పం చేసి, తక్బీర్, ఖిరాఅత్, రుకూ, సజ్దా మరియు సలామ్‌తో నమాజ్ చేయండి.",
      ur: "قبلہ رُخ ہو کر نیت کریں، پھر تکبیر، قراءت، رکوع، سجدہ اور سلام کے ساتھ نماز ادا کریں۔",
    },
  },
  {
    id: "ramadan",
    icon: "ramadan",
    title: { en: "Ramadan", te: "రమదాన్", ur: "رمضان" },
    body: {
      en: "The blessed month of fasting, night prayers, Quran recitation and generosity to those in need.",
      te: "ఉపవాసం, తరావీహ్, ఖురాన్ పఠనం మరియు దానధర్మాల శుభ మాసం.",
      ur: "روزے، تراویح، تلاوتِ قرآن اور سخاوت کا مبارک مہینہ۔",
    },
  },
  {
    id: "zakat",
    icon: "zakat",
    title: { en: "Zakat", te: "జకాత్", ur: "زکوٰۃ" },
    body: {
      en: "An annual purification of wealth — 2.5% of savings given to the poor and those in need.",
      te: "సంపద శుద్ధి — పొదుపులో 2.5% పేదలకు ఇవ్వడం.",
      ur: "مال کی سالانہ پاکیزگی — بچت کا 2.5 فیصد مستحقین کو دینا۔",
    },
  },
  {
    id: "hajj",
    icon: "hajj",
    title: { en: "Hajj", te: "హజ్", ur: "حج" },
    body: {
      en: "The pilgrimage to Makkah, obligatory once in a lifetime for those who are able.",
      te: "శక్తి ఉన్నవారికి జీవితంలో ఒకసారి తప్పనిసరి అయిన మక్కా యాత్ర.",
      ur: "مکہ کا سفر، صاحبِ استطاعت پر زندگی میں ایک بار فرض۔",
    },
  },
];

export const defaultContent: SiteContent = {
  prayerTimes: {
    fajr: "05:02",
    sunrise: "06:18",
    dhuhr: "13:05",
    asr: "16:45",
    maghrib: "18:41",
    isha: "20:15",
    jumuah: "13:30",
  },
  jumuahKhutbah: "13:15",
  announcements: [
    {
      id: "a1",
      date: "Every Thursday",
      title: {
        en: "Weekly Tafsir Circle",
        te: "వారపు తఫ్సీర్ సభ",
        ur: "ہفتہ وار درسِ تفسیر",
      },
      body: {
        en: "Join us every Thursday after Isha for a reflective study of Surah Al-Kahf in the main prayer hall.",
        te: "ప్రతి గురువారం ఇషా తర్వాత సూరహ్ అల్-కహ్ఫ్ అధ్యయనానికి ప్రధాన హాల్‌లో చేరండి.",
        ur: "ہر جمعرات نمازِ عشاء کے بعد سورۃ الکہف کے درس میں شریک ہوں۔",
      },
    },
    {
      id: "a2",
      date: "Open now",
      title: {
        en: "Quran Classes Registration Open",
        te: "ఖురాన్ తరగతుల నమోదు ప్రారంభం",
        ur: "قرآن کلاسز میں داخلہ جاری",
      },
      body: {
        en: "Tajweed and hifz classes for children and adults. Please register at the front desk.",
        te: "పిల్లలు మరియు పెద్దల కోసం తజ్వీద్ మరియు హిఫ్జ్ తరగతులు. కార్యాలయంలో నమోదు చేసుకోండి.",
        ur: "بچوں اور بڑوں کے لیے تجوید و حفظ کی کلاسز۔ دفتر میں اندراج کروائیں۔",
      },
    },
    {
      id: "a3",
      date: "Fridays",
      title: {
        en: "Jumu'ah Parking Notice",
        te: "జుమా పార్కింగ్ సూచన",
        ur: "جمعہ پارکنگ اطلاع",
      },
      body: {
        en: "Kindly use the rear courtyard parking on Fridays and avoid blocking neighbouring driveways.",
        te: "శుక్రవారాల్లో వెనుక ప్రాంగణ పార్కింగ్ ఉపయోగించండి; పొరుగువారి దారులను అడ్డుకోవద్దు.",
        ur: "جمعہ کے دن پچھلے صحن کی پارکنگ استعمال کریں اور ہمسایوں کے راستے بند نہ کریں۔",
      },
    },
  ],
  aboutSummary: {
    en: "Masjid-e-Meraj opens its doors to worshippers, students and neighbours alike — daily prayers, Jumu'ah, Quran classes and community services.",
    te: "మస్జిద్-ఎ-మెరాజ్ ఆరాధకులకు, విద్యార్థులకు మరియు పొరుగువారికి స్వాగతం — రోజువారీ నమాజ్, జుమా, ఖురాన్ తరగతులు మరియు సమాజ సేవలు.",
    ur: "مسجدِ معراج نمازیوں، طلبہ اور اہلِ محلہ کے لیے کھلی ہے — پنجگانہ نماز، جمعہ، قرآن کلاسز اور خدمتِ خلق۔",
  },
  aboutFull: {
    en: "Masjid-e-Meraj opens its doors to worshippers, students and neighbours alike. Our halls host the five daily prayers, the weekly Jumu'ah khutbah, Quran and Arabic classes, and services that support families across the city.\n\nThe masjid was built by the local community and continues to be maintained by it. Beyond prayer, we run children's maktab classes, weekly tafsir and hadith circles, marriage and funeral services, and Ramadan iftar for the neighbourhood.\n\nVisitors of every background are welcome. If you are new to the masjid or new to Islam, please introduce yourself to the Imam after any prayer — we will be glad to help.",
    te: "మస్జిద్-ఎ-మెరాజ్ ఆరాధకులకు, విద్యార్థులకు మరియు పొరుగువారికి తన తలుపులు తెరుస్తుంది. మా హాళ్లలో ఐదు రోజువారీ నమాజులు, వారపు జుమా ఖుత్బా, ఖురాన్ మరియు అరబిక్ తరగతులు నిర్వహిస్తారు.\n\nఈ మస్జిద్‌ను స్థానిక సమాజం నిర్మించింది మరియు నిర్వహిస్తోంది. నమాజ్‌తో పాటు పిల్లల మక్తబ్ తరగతులు, వారపు తఫ్సీర్ మరియు హదీస్ సభలు, వివాహ మరియు అంతిమ సంస్కార సేవలు, రమదాన్ ఇఫ్తార్ అందిస్తాము.\n\nఅన్ని నేపథ్యాల సందర్శకులకు స్వాగతం. మీరు కొత్తవారైతే, ఏదైనా నమాజ్ తర్వాత ఇమామ్‌ను కలవండి.",
    ur: "مسجدِ معراج نمازیوں، طلبہ اور اہلِ محلہ سب کے لیے کھلی ہے۔ یہاں پنجگانہ نماز، جمعہ کا خطبہ، قرآن و عربی کی کلاسز اور خاندانوں کے لیے خدمات فراہم کی جاتی ہیں۔\n\nیہ مسجد مقامی برادری نے تعمیر کی اور وہی اس کی دیکھ بھال کرتی ہے۔ نماز کے علاوہ بچوں کا مکتب، ہفتہ وار درسِ تفسیر و حدیث، نکاح و جنازہ کی خدمات اور رمضان میں افطار کا اہتمام ہوتا ہے۔\n\nہر پس منظر کے مہمانوں کو خوش آمدید۔ اگر آپ نئے ہیں تو نماز کے بعد امام صاحب سے ضرور ملیں۔",
  },
  contact: {
    phone: "+00 1234 567 890",
    whatsapp: "+00 1234 567 890",
    email: "info@masjidemeraj.org",
    website: "https://masjidemeraj.org",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
  location: {
    name: "Masjid-e-Meraj",
    address: "Masjid-e-Meraj, Main Road, Your City, State - 500001",
    latitude: "17.3850",
    longitude: "78.4867",
    mapsUrl: "https://www.google.com/maps?q=17.3850,78.4867",
  },
  quranPdfUrl: "",
  quranPdfName: "",
  quranPdfPath: "",
  logoUrl: "",
  heroImageUrl: "",
  logoPath: "",
  heroPath: "",
  dailyVerse: {
    reference: "Surah Al-Qamar 54:17",
    arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    translation: {
      en: "And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?",
      te: "మేము ఖురాన్‌ను జ్ఞాపకం చేసుకోవడానికి సులభతరం చేశాము. అయితే గుర్తు చేసుకునే వారు ఎవరైనా ఉన్నారా?",
      ur: "اور بےشک ہم نے قرآن کو یاد رکھنے کے لیے آسان کر دیا، تو ہے کوئی نصیحت حاصل کرنے والا؟",
    },
  },
  dailyHadith: {
    source: "Sahih al-Bukhari",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    text: {
      en: "The Prophet ﷺ said: The best of you are those who learn the Quran and teach it.",
      te: "ప్రవక్త ﷺ చెప్పారు: మీలో ఉత్తములు ఖురాన్ నేర్చుకుని, ఇతరులకు నేర్పేవారు.",
      ur: "نبی ﷺ نے فرمایا: تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔",
    },
  },
  basics,
};

const CONTENT_KEY = "mem-content";
const ADMIN_KEY = "mem-admin";
/** Development-only credentials. Replace with real auth when the backend is added. */
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "12345678910";

type ContentContextValue = {
  content: SiteContent;
  saveContent: (next: SiteContent) => void;
  resetContent: () => void;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const ContentContext = createContext<ContentContextValue>({
  content: defaultContent,
  saveContent: () => {},
  resetContent: () => {},
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

/** Accepts a legacy plain string or a partial multilingual record. */
function toMultilingual(value: unknown, fallback: Multilingual): Multilingual {
  if (typeof value === "string" && value.trim()) return { en: value, te: value, ur: value };
  if (value && typeof value === "object") {
    const v = value as Partial<Multilingual>;
    return { en: v.en ?? fallback.en, te: v.te ?? fallback.te, ur: v.ur ?? fallback.ur };
  }
  return fallback;
}

/** Normalises anything previously stored (older shapes) into the current schema. */
function migrate(parsed: Record<string, unknown>): SiteContent {
  const merged = { ...defaultContent, ...parsed } as SiteContent & Record<string, unknown>;

  const legacyAbout = parsed["about"];
  merged.aboutSummary = toMultilingual(
    parsed["aboutSummary"] ?? legacyAbout,
    defaultContent.aboutSummary,
  );
  merged.aboutFull = toMultilingual(parsed["aboutFull"] ?? legacyAbout, defaultContent.aboutFull);

  const anns = Array.isArray(parsed["announcements"])
    ? (parsed["announcements"] as Record<string, unknown>[])
    : [];
  if (anns.length) {
    merged.announcements = anns.map((a, i) => ({
      id: String(a["id"] ?? `a${i}`),
      date: String(a["date"] ?? ""),
      title: toMultilingual(a["title"], emptyMultilingual),
      body: toMultilingual(a["body"], emptyMultilingual),
    }));
  }

  merged.dailyHadith = {
    source: merged.dailyHadith?.source ?? defaultContent.dailyHadith.source,
    arabic: merged.dailyHadith?.arabic ?? defaultContent.dailyHadith.arabic,
    text: toMultilingual(merged.dailyHadith?.text, defaultContent.dailyHadith.text),
  };
  merged.logoUrl = typeof merged.logoUrl === "string" ? merged.logoUrl : "";
  merged.heroImageUrl = typeof merged.heroImageUrl === "string" ? merged.heroImageUrl : "";

  delete (merged as Record<string, unknown>)["about"];
  return merged;
}

function loadContent(): SiteContent | null {
  try {
    const raw = window.localStorage.getItem(CONTENT_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = loadContent();
    if (stored) setContent(stored);
    setIsAdmin(window.sessionStorage.getItem(ADMIN_KEY) === "1");
  }, []);

  const saveContent = useCallback((next: SiteContent) => {
    setContent(next);
    try {
      window.localStorage.setItem(CONTENT_KEY, JSON.stringify(next));
    } catch {
      /* storage full — uploaded files can be large; content stays live in memory */
    }
  }, []);

  const resetContent = useCallback(() => {
    setContent(defaultContent);
    window.localStorage.removeItem(CONTENT_KEY);
  }, []);

  const login = useCallback((username: string, password: string) => {
    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return false;
    window.sessionStorage.setItem(ADMIN_KEY, "1");
    setIsAdmin(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  }, []);

  return (
    <ContentContext.Provider
      value={{ content, saveContent, resetContent, isAdmin, login, logout }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
