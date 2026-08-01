import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./i18n";

/**
 * Front-end content store.
 *
 * Everything the admin can edit lives here. Today it persists to localStorage;
 * swapping `loadContent`/`persistContent` for API calls (Lovable Cloud) later
 * is the only change needed for real backend integration.
 */

export type Multilingual = Record<Lang, string>;

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha" | "jumuah";

export type Announcement = { id: string; title: string; body: string; date: string };

export type BasicTopic = {
  id: string;
  icon:
    | "pillars"
    | "faith"
    | "salah"
    | "wudu"
    | "ramadan"
    | "zakat"
    | "hajj";
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
  about: string;
  contact: ContactInfo;
  location: MasjidLocation;
  quranPdfUrl: string;
  quranPdfName: string;
  dailyVerse: { reference: string; arabic: string; translation: Multilingual };
  dailyHadith: { source: string; text: Multilingual };
  basics: BasicTopic[];
};

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
    id: "wudu",
    icon: "wudu",
    title: { en: "Wudu Guide", te: "వుజూ మార్గదర్శిని", ur: "وضو کا طریقہ" },
    body: {
      en: "Wash the hands, rinse the mouth and nose, wash the face and arms, wipe the head, then wash the feet.",
      te: "చేతులు, నోరు, ముక్కు కడిగి, ముఖం మరియు చేతులు కడిగి, తలపై తుడిచి, పాదాలు కడగాలి.",
      ur: "ہاتھ دھوئیں، کلی کریں، ناک صاف کریں، چہرہ اور بازو دھوئیں، سر کا مسح کریں، پھر پاؤں دھوئیں۔",
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
      title: "Weekly Tafsir Circle",
      body: "Join us every Thursday after Isha for a reflective study of Surah Al-Kahf in the main prayer hall.",
      date: "Every Thursday",
    },
    {
      id: "a2",
      title: "Quran Classes Registration Open",
      body: "Tajweed and hifz classes for children and adults. Please register at the front desk.",
      date: "Open now",
    },
    {
      id: "a3",
      title: "Jumu'ah Parking Notice",
      body: "Kindly use the rear courtyard parking on Fridays and avoid blocking neighbouring driveways.",
      date: "Fridays",
    },
  ],
  about:
    "Masjid-e-Meraj opens its doors to worshippers, students and neighbours alike. Our halls host the five daily prayers, the weekly Jumu'ah khutbah, Quran and Arabic classes, and services that support families across the city.",
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
/** Demo-only passcode. Replace with real auth when the backend is added. */
export const ADMIN_PASSWORD = "meraj786";

type ContentContextValue = {
  content: SiteContent;
  saveContent: (next: SiteContent) => void;
  resetContent: () => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
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

function loadContent(): SiteContent | null {
  try {
    const raw = window.localStorage.getItem(CONTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return { ...defaultContent, ...parsed } as SiteContent;
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
    window.localStorage.setItem(CONTENT_KEY, JSON.stringify(next));
  }, []);

  const resetContent = useCallback(() => {
    setContent(defaultContent);
    window.localStorage.removeItem(CONTENT_KEY);
  }, []);

  const login = useCallback((password: string) => {
    if (password !== ADMIN_PASSWORD) return false;
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