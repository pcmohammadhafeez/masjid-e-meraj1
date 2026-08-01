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

export type SiteContent = {
  prayerTimes: Record<PrayerKey, string>;
  jumuahKhutbah: string;
  announcements: Announcement[];
  about: string;
  contact: { address: string; phone: string; email: string };
  mapsLink: string;
  quranPdfUrl: string;
  quranPdfName: string;
  dailyVerse: { reference: string; arabic: string; translation: Multilingual };
  dailyHadith: { source: string; text: Multilingual };
};

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
    address: "123 Meraj Street, Garden Colony, City 400001",
    phone: "+00 1234 567 890",
    email: "info@masjidemeraj.org",
  },
  mapsLink: "https://www.google.com/maps",
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