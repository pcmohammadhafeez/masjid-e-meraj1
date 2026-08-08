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
      en: "The Five Pillars are the foundation of a Muslim's life.\n• Shahadah – Testifying that there is no deity worthy of worship except Allah and Muhammad ﷺ is His Messenger.\n• Salah – Performing the five daily prayers at their prescribed times.\n• Zakat – Giving 2.5% of eligible savings annually to those who qualify.\n• Sawm – Fasting during the month of Ramadan from dawn until sunset.\n• Hajj – Pilgrimage to Makkah once in a lifetime for every Muslim who is physically and financially able.",
      te: "ఐదు మూల స్తంభాలు ముస్లిం జీవితానికి పునాది.\n• షహాదా – అల్లాహ్ తప్ప ఆరాధనకు అర్హుడైన దైవం లేడని, ముహమ్మద్ ﷺ ఆయన ప్రవక్త అని సాక్ష్యం ఇవ్వడం.\n• నమాజ్ – ఐదు పూటల నమాజులను నిర్ణీత సమయాల్లో నిర్వర్తించడం.\n• జకాత్ – అర్హత గల పొదుపులో 2.5% ప్రతి సంవత్సరం అర్హులకు ఇవ్వడం.\n• రోజా – రమదాన్ మాసంలో ఉదయం నుండి సూర్యాస్తమయం వరకు ఉపవాసం ఉండటం.\n• హజ్ – శారీరకంగా, ఆర్థికంగా శక్తి ఉన్న ప్రతి ముస్లిం జీవితంలో ఒకసారి మక్కా యాత్ర చేయడం.",
      ur: "پانچ ارکان مسلمان کی زندگی کی بنیاد ہیں۔\n• شہادت – گواہی دینا کہ اللہ کے سوا کوئی عبادت کے لائق نہیں اور محمد ﷺ اُس کے رسول ہیں۔\n• نماز – پانچ وقت کی نمازیں اپنے مقررہ اوقات میں ادا کرنا۔\n• زکوٰۃ – سالانہ قابلِ زکوٰۃ بچت کا 2.5 فیصد مستحقین کو دینا۔\n• روزہ – ماہِ رمضان میں صبح صادق سے غروبِ آفتاب تک روزہ رکھنا۔\n• حج – ہر صاحبِ استطاعت مسلمان پر زندگی میں ایک بار مکہ کا حج۔",
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
      en: "A Muslim believes in:\n• Allah\n• His Angels\n• His Revealed Books\n• His Messengers\n• The Last Day\n• Divine Decree (Qadr), both good and bad, by Allah's wisdom.",
      te: "ఒక ముస్లిం వీటిపై విశ్వసిస్తాడు:\n• అల్లాహ్\n• ఆయన దైవదూతలు\n• ఆయన అవతరించిన గ్రంథాలు\n• ఆయన ప్రవక్తలు\n• తీర్పు దినం\n• దైవ నిర్ణయం (ఖద్ర్) — మేలు అయినా, కీడు అయినా అల్లాహ్ వివేకంతోనే.",
      ur: "مسلمان ان پر ایمان رکھتا ہے:\n• اللہ\n• اُس کے فرشتے\n• اُس کی نازل کردہ کتابیں\n• اُس کے رسول\n• روزِ آخرت\n• تقدیر (قدر) — اچھی ہو یا بری، اللہ کی حکمت سے۔",
    },
  },
  {
    id: "wudu",
    icon: "wudu",
    title: { en: "How to Perform Wudu", te: "వుజూ ఎలా చేయాలి", ur: "وضو کیسے کریں" },
    body: {
      en: "1. Make the intention.\n2. Say Bismillah.\n3. Wash both hands three times.\n4. Rinse the mouth three times.\n5. Clean the nose three times.\n6. Wash the face three times.\n7. Wash the right arm including the elbow three times.\n8. Wash the left arm including the elbow three times.\n9. Wipe the head once.\n10. Wipe both ears.\n11. Wash the right foot including the ankle three times.\n12. Wash the left foot including the ankle three times.",
      te: "1. సంకల్పం చేయండి.\n2. బిస్మిల్లాహ్ పలకండి.\n3. రెండు చేతులు మూడు సార్లు కడగండి.\n4. మూడు సార్లు పుక్కిలించండి.\n5. మూడు సార్లు ముక్కు శుభ్రం చేయండి.\n6. ముఖం మూడు సార్లు కడగండి.\n7. కుడి చేతిని మోచేయి వరకు మూడు సార్లు కడగండి.\n8. ఎడమ చేతిని మోచేయి వరకు మూడు సార్లు కడగండి.\n9. తలపై ఒకసారి తుడవండి.\n10. రెండు చెవులను తుడవండి.\n11. కుడి పాదాన్ని చీలమండ వరకు మూడు సార్లు కడగండి.\n12. ఎడమ పాదాన్ని చీలమండ వరకు మూడు సార్లు కడగండి.",
      ur: "1. نیت کریں۔\n2. بسم اللہ کہیں۔\n3. دونوں ہاتھ تین بار دھوئیں۔\n4. تین بار کلی کریں۔\n5. تین بار ناک صاف کریں۔\n6. چہرہ تین بار دھوئیں۔\n7. دایاں بازو کہنی سمیت تین بار دھوئیں۔\n8. بایاں بازو کہنی سمیت تین بار دھوئیں۔\n9. سر کا ایک بار مسح کریں۔\n10. دونوں کانوں کا مسح کریں۔\n11. دایاں پاؤں ٹخنے سمیت تین بار دھوئیں۔\n12. بایاں پاؤں ٹخنے سمیت تین بار دھوئیں۔",
    },
  },
  {
    id: "salah",
    icon: "salah",
    title: { en: "How to Pray Salah", te: "నమాజ్ ఎలా చేయాలి", ur: "نماز کیسے پڑھیں" },
    body: {
      en: "1. Perform Wudu.\n2. Face the Qiblah.\n3. Make the intention.\n4. Say Takbir.\n5. Recite Surah Al-Fatihah.\n6. Recite another Surah.\n7. Perform Ruku.\n8. Stand upright.\n9. Perform the first Sujud.\n10. Sit briefly.\n11. Perform the second Sujud.\n12. Continue the remaining Rak'ahs.\n13. Recite Tashahhud.\n14. Send blessings upon Prophet Muhammad ﷺ.\n15. End the prayer with Tasleem.",
      te: "1. వుజూ చేయండి.\n2. ఖిబ్లా వైపు తిరగండి.\n3. సంకల్పం చేయండి.\n4. తక్బీర్ పలకండి.\n5. సూరహ్ అల్-ఫాతిహా పఠించండి.\n6. మరొక సూరహ్ పఠించండి.\n7. రుకూ చేయండి.\n8. నిటారుగా నిలబడండి.\n9. మొదటి సజ్దా చేయండి.\n10. కొద్దిసేపు కూర్చోండి.\n11. రెండవ సజ్దా చేయండి.\n12. మిగిలిన రకాతులను కొనసాగించండి.\n13. తషహ్హుద్ పఠించండి.\n14. ప్రవక్త ముహమ్మద్ ﷺ పై దరూద్ పంపండి.\n15. సలామ్‌తో నమాజ్ ముగించండి.",
      ur: "1. وضو کریں۔\n2. قبلہ رُخ ہوں۔\n3. نیت کریں۔\n4. تکبیر کہیں۔\n5. سورۃ الفاتحہ پڑھیں۔\n6. کوئی دوسری سورت پڑھیں۔\n7. رکوع کریں۔\n8. سیدھے کھڑے ہوں۔\n9. پہلا سجدہ کریں۔\n10. مختصر بیٹھیں۔\n11. دوسرا سجدہ کریں۔\n12. باقی رکعتیں اسی طرح پوری کریں۔\n13. تشہد پڑھیں۔\n14. نبی کریم ﷺ پر درود بھیجیں۔\n15. سلام کے ساتھ نماز مکمل کریں۔",
    },
  },
  {
    id: "ramadan",
    icon: "ramadan",
    title: { en: "Ramadan", te: "రమదాన్", ur: "رمضان" },
    body: {
      en: "Ramadan is the ninth month of the Islamic calendar.\nDuring Ramadan Muslims:\n• Fast from dawn until sunset.\n• Increase Quran recitation.\n• Perform Taraweeh prayers.\n• Make abundant Dua.\n• Give charity.\n• Seek Laylatul Qadr.\n• Increase good deeds.\n• Break the fast following the Sunnah.",
      te: "రమదాన్ ఇస్లామీ కేలండర్‌లో తొమ్మిదవ మాసం.\nరమదాన్‌లో ముస్లిములు:\n• ఉదయం నుండి సూర్యాస్తమయం వరకు ఉపవాసం ఉంటారు.\n• ఖురాన్ పఠనం పెంచుతారు.\n• తరావీహ్ నమాజ్ చేస్తారు.\n• అధికంగా దుఆ చేస్తారు.\n• దానధర్మాలు చేస్తారు.\n• లైలతుల్ ఖద్ర్ కోరుకుంటారు.\n• సత్కార్యాలు పెంచుతారు.\n• సున్నత్ ప్రకారం ఉపవాసం విరమిస్తారు.",
      ur: "رمضان اسلامی کیلنڈر کا نواں مہینہ ہے۔\nرمضان میں مسلمان:\n• صبح صادق سے غروبِ آفتاب تک روزہ رکھتے ہیں۔\n• تلاوتِ قرآن بڑھاتے ہیں۔\n• تراویح ادا کرتے ہیں۔\n• کثرت سے دعا کرتے ہیں۔\n• صدقہ و خیرات کرتے ہیں۔\n• لیلۃ القدر کی تلاش کرتے ہیں۔\n• نیک اعمال میں اضافہ کرتے ہیں۔\n• سنت کے مطابق روزہ افطار کرتے ہیں۔",
    },
  },
  {
    id: "zakat",
    icon: "zakat",
    title: { en: "Zakat", te: "జకాత్", ur: "زکوٰۃ" },
    body: {
      en: "Zakat is an obligatory act of worship for Muslims whose wealth reaches the Nisab.\nIt purifies wealth and supports those who are eligible.\nGenerally, 2.5% of qualifying savings is given annually.\nEligible recipients include the poor, needy and others mentioned in the Quran.",
      te: "నిసాబ్ చేరిన సంపద ఉన్న ముస్లిములపై జకాత్ తప్పనిసరి ఆరాధన.\nఇది సంపదను పరిశుద్ధం చేస్తుంది మరియు అర్హులకు తోడ్పడుతుంది.\nసాధారణంగా అర్హత గల పొదుపులో 2.5% ప్రతి సంవత్సరం ఇవ్వబడుతుంది.\nఅర్హులలో పేదలు, నిరుపేదలు మరియు ఖురాన్‌లో పేర్కొన్న ఇతరులు ఉంటారు.",
      ur: "زکوٰۃ اُن مسلمانوں پر فرض عبادت ہے جن کا مال نصاب کو پہنچ جائے۔\nیہ مال کو پاک کرتی ہے اور مستحقین کی مدد کرتی ہے۔\nعام طور پر قابلِ زکوٰۃ بچت کا 2.5 فیصد سالانہ دیا جاتا ہے۔\nمستحقین میں فقراء، مساکین اور قرآن میں مذکور دیگر افراد شامل ہیں۔",
    },
  },
  {
    id: "hajj",
    icon: "hajj",
    title: { en: "Hajj", te: "హజ్", ur: "حج" },
    body: {
      en: "Hajj is one of the Five Pillars of Islam.\nIt is obligatory once in a lifetime for Muslims who are physically and financially able.\nMajor rites include:\n• Ihram\n• Tawaf\n• Sa'i\n• Standing at Arafah\n• Muzdalifah\n• Stoning the Jamarat\n• Sacrifice (where applicable)\n• Farewell Tawaf",
      te: "హజ్ ఇస్లాం ఐదు మూల స్తంభాలలో ఒకటి.\nశారీరకంగా, ఆర్థికంగా శక్తి ఉన్న ముస్లిములకు జీవితంలో ఒకసారి తప్పనిసరి.\nప్రధాన ఆచారాలు:\n• ఇహ్రామ్\n• తవాఫ్\n• సఈ\n• అరఫాలో నిలబడటం\n• ముజ్‌దలిఫా\n• జమరాత్‌పై రాళ్ళు వేయడం\n• ఖుర్బానీ (వర్తించే చోట)\n• వీడ్కోలు తవాఫ్",
      ur: "حج اسلام کے پانچ ارکان میں سے ایک ہے۔\nیہ ہر صاحبِ استطاعت مسلمان پر زندگی میں ایک بار فرض ہے۔\nاہم ارکان:\n• احرام\n• طواف\n• سعی\n• وقوفِ عرفہ\n• مزدلفہ\n• رمی جمرات\n• قربانی (جہاں لازم ہو)\n• طوافِ وداع",
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

/* ------------------------------------------------------------------ *
 * Cloud-backed store
 * ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

/** Accepts a legacy plain string or a partial multilingual record. */
function toMultilingual(value: unknown, fallback: Multilingual): Multilingual {
  if (typeof value === "string" && value.trim()) return { en: value, te: value, ur: value };
  if (value && typeof value === "object") {
    const v = value as Partial<Multilingual>;
    return { en: v.en ?? fallback.en, te: v.te ?? fallback.te, ur: v.ur ?? fallback.ur };
  }
  return fallback;
}

const str = (v: unknown, fallback = "") => (typeof v === "string" && v ? v : fallback);

/**
 * Turns a stored value into something a browser can load. Absolute URLs pass
 * through untouched; anything else is treated as a path inside the private
 * asset bucket and resolved to a time-limited signed URL.
 */
async function resolveAsset(value: string): Promise<string> {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const { data } = await supabase.storage.from(ASSET_BUCKET).createSignedUrl(value, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? "";
}

export async function fetchContent(): Promise<SiteContent> {
  const [times, anns, about, settings, quran, verse, hadith] = await Promise.all([
    supabase.from("prayer_times").select("*").eq("id", "default").maybeSingle(),
    supabase.from("announcements").select("*").order("position", { ascending: true }),
    supabase.from("about_masjid").select("*").eq("id", "default").maybeSingle(),
    supabase.from("settings").select("*").eq("id", "default").maybeSingle(),
    supabase.from("quran_pdf").select("*").eq("id", "default").maybeSingle(),
    supabase.from("daily_verse").select("*").eq("id", "default").maybeSingle(),
    supabase.from("daily_hadith").select("*").eq("id", "default").maybeSingle(),
  ]);

  const t = (times.data ?? {}) as Row;
  const ab = (about.data ?? {}) as Row;
  const st = (settings.data ?? {}) as Row;
  const qr = (quran.data ?? {}) as Row;
  const dv = (verse.data ?? {}) as Row;
  const dh = (hadith.data ?? {}) as Row;

  const storedTimes = (t["times"] ?? {}) as Record<string, unknown>;
  const prayerTimes = { ...defaultContent.prayerTimes };
  (Object.keys(prayerTimes) as PrayerKey[]).forEach((k) => {
    prayerTimes[k] = str(storedTimes[k], defaultContent.prayerTimes[k]);
  });

  const announcements: Announcement[] = ((anns.data ?? []) as Row[]).map((a) => ({
    id: String(a["id"]),
    date: str(a["date_label"]),
    title: toMultilingual(a["title"], emptyMultilingual),
    body: toMultilingual(a["body"], emptyMultilingual),
  }));

  const contact = { ...defaultContent.contact, ...((st["contact"] ?? {}) as object) };
  const location = { ...defaultContent.location, ...((st["location"] ?? {}) as object) };
  const rawBasics = st["basics"];
  const basicsList: BasicTopic[] = Array.isArray(rawBasics) && rawBasics.length
    ? (rawBasics as Row[]).map((b, i) => ({
        id: str(b["id"], `topic-${i}`),
        icon: (str(b["icon"], "pillars") as BasicTopic["icon"]),
        title: toMultilingual(b["title"], emptyMultilingual),
        body: toMultilingual(b["body"], emptyMultilingual),
      }))
    : defaultContent.basics;

  const quranPdfPath = str(qr["storage_path"]);
  const quranStored = str(qr["url"]) || quranPdfPath;
  const logoPath = str(st["logo_url"]);
  const heroPath = str(st["hero_image_url"]);

  const [quranPdfUrl, logoUrl, heroImageUrl] = await Promise.all([
    resolveAsset(quranStored),
    resolveAsset(logoPath),
    resolveAsset(heroPath),
  ]);

  return {
    prayerTimes,
    jumuahKhutbah: str(t["jumuah_khutbah"], defaultContent.jumuahKhutbah),
    announcements: announcements.length ? announcements : [],
    aboutSummary: toMultilingual(ab["summary"], defaultContent.aboutSummary),
    aboutFull: toMultilingual(ab["full_text"], defaultContent.aboutFull),
    contact,
    location,
    quranPdfUrl,
    quranPdfName: str(qr["name"]),
    quranPdfPath: str(qr["url"]) || quranPdfPath,
    logoUrl,
    heroImageUrl,
    logoPath,
    heroPath,
    dailyVerse: {
      reference: str(dv["reference"], defaultContent.dailyVerse.reference),
      arabic: str(dv["arabic"], defaultContent.dailyVerse.arabic),
      translation: toMultilingual(dv["translation"], defaultContent.dailyVerse.translation),
    },
    dailyHadith: {
      source: str(dh["source"], defaultContent.dailyHadith.source),
      arabic: str(dh["arabic"], defaultContent.dailyHadith.arabic),
      text: toMultilingual(dh["text"], defaultContent.dailyHadith.text),
    },
    basics: basicsList,
  };
}

/** Writes the whole editable site content back to the database (admins only). */
export async function persistContent(next: SiteContent): Promise<void> {
  const isUrl = (v: string) => /^https?:\/\//i.test(v);

  const results = await Promise.all([
    supabase
      .from("prayer_times")
      .upsert({ id: "default", times: next.prayerTimes, jumuah_khutbah: next.jumuahKhutbah }),
    supabase
      .from("about_masjid")
      .upsert({ id: "default", summary: next.aboutSummary, full_text: next.aboutFull }),
    supabase.from("settings").upsert({
      id: "default",
      contact: next.contact,
      location: next.location,
      logo_url: next.logoPath,
      hero_image_url: next.heroPath,
      basics: next.basics,
    }),
    supabase.from("quran_pdf").upsert({
      id: "default",
      url: isUrl(next.quranPdfPath) ? next.quranPdfPath : "",
      storage_path: isUrl(next.quranPdfPath) ? "" : next.quranPdfPath,
      name: next.quranPdfName,
    }),
    supabase.from("daily_verse").upsert({
      id: "default",
      reference: next.dailyVerse.reference,
      arabic: next.dailyVerse.arabic,
      translation: next.dailyVerse.translation,
    }),
    supabase.from("daily_hadith").upsert({
      id: "default",
      source: next.dailyHadith.source,
      arabic: next.dailyHadith.arabic,
      text: next.dailyHadith.text,
    }),
  ]);

  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  // Announcements are a list: replace it wholesale so deletions stick too.
  const existing = await supabase.from("announcements").select("id");
  if (existing.error) throw new Error(existing.error.message);
  const keep = new Set(next.announcements.map((a) => a.id));
  const removable = (existing.data ?? []).map((r) => r.id).filter((id) => !keep.has(id));
  if (removable.length) {
    const del = await supabase.from("announcements").delete().in("id", removable);
    if (del.error) throw new Error(del.error.message);
  }

  const isUuid = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  for (const [i, a] of next.announcements.entries()) {
    const payload = { position: i, date_label: a.date, title: a.title, body: a.body };
    const res = isUuid(a.id)
      ? await supabase.from("announcements").upsert({ id: a.id, ...payload })
      : await supabase.from("announcements").insert(payload);
    if (res.error) throw new Error(res.error.message);
  }
}

/** Uploads a file to the asset bucket and returns its storage path. */
export async function uploadAsset(folder: string, file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return path;
}

/** Removes a previously uploaded file (used when replacing the Quran PDF). */
export async function removeAsset(path: string): Promise<void> {
  if (!path || /^https?:\/\//i.test(path)) return;
  await supabase.storage.from(ASSET_BUCKET).remove([path]);
}

type ContentContextValue = {
  content: SiteContent;
  loading: boolean;
  refresh: () => Promise<void>;
  saveContent: (next: SiteContent) => Promise<void>;
  resetContent: () => Promise<void>;
  session: Session | null;
  isAdmin: boolean;
  refreshRole: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue>({
  content: defaultContent,
  loading: true,
  refresh: async () => {},
  saveContent: async () => {},
  resetContent: async () => {},
  session: null,
  isAdmin: false,
  refreshRole: async () => {},
  login: async () => "Not ready",
  signUp: async () => "Not ready",
  logout: async () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setContent(await fetchContent());
    } catch (error) {
      console.error("[content] failed to load", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const syncRole = useCallback(async (next: Session | null) => {
    if (!next?.user) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", next.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(Boolean(data));
  }, []);

  // Session + admin role. Kept in Supabase auth, never in app localStorage.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void syncRole(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void syncRole(next);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [syncRole]);

  const refreshRole = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await syncRole(data.session);
  }, [syncRole]);

  const saveContent = useCallback(
    async (next: SiteContent) => {
      await persistContent(next);
      await refresh();
    },
    [refresh],
  );

  const resetContent = useCallback(async () => {
    await persistContent({ ...defaultContent, announcements: [] });
    await refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? error.message : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    return error ? error.message : null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({
      content,
      loading,
      refresh,
      saveContent,
      resetContent,
      session,
      isAdmin,
      refreshRole,
      login,
      signUp,
      logout,
    }),
    [
      content,
      loading,
      refresh,
      saveContent,
      resetContent,
      session,
      isAdmin,
      refreshRole,
      login,
      signUp,
      logout,
    ],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
