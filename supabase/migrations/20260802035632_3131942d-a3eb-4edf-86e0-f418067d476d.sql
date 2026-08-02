
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ prayer_times ============
CREATE TABLE public.prayer_times (
  id text PRIMARY KEY DEFAULT 'default',
  times jsonb NOT NULL DEFAULT '{}'::jsonb,
  jumuah_khutbah text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prayer_times TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_times TO authenticated;
GRANT ALL ON public.prayer_times TO service_role;
ALTER TABLE public.prayer_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read prayer times" ON public.prayer_times FOR SELECT USING (true);
CREATE POLICY "Admins manage prayer times" ON public.prayer_times FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER prayer_times_updated_at BEFORE UPDATE ON public.prayer_times
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ announcements ============
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position integer NOT NULL DEFAULT 0,
  date_label text NOT NULL DEFAULT '',
  title jsonb NOT NULL DEFAULT '{"en":"","te":"","ur":""}'::jsonb,
  body jsonb NOT NULL DEFAULT '{"en":"","te":"","ur":""}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ about_masjid ============
CREATE TABLE public.about_masjid (
  id text PRIMARY KEY DEFAULT 'default',
  summary jsonb NOT NULL DEFAULT '{"en":"","te":"","ur":""}'::jsonb,
  full_text jsonb NOT NULL DEFAULT '{"en":"","te":"","ur":""}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_masjid TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_masjid TO authenticated;
GRANT ALL ON public.about_masjid TO service_role;
ALTER TABLE public.about_masjid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read about" ON public.about_masjid FOR SELECT USING (true);
CREATE POLICY "Admins manage about" ON public.about_masjid FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER about_masjid_updated_at BEFORE UPDATE ON public.about_masjid
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ settings ============
CREATE TABLE public.settings (
  id text PRIMARY KEY DEFAULT 'default',
  contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  location jsonb NOT NULL DEFAULT '{}'::jsonb,
  logo_url text NOT NULL DEFAULT '',
  hero_image_url text NOT NULL DEFAULT '',
  basics jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ quran_pdf ============
CREATE TABLE public.quran_pdf (
  id text PRIMARY KEY DEFAULT 'default',
  url text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  storage_path text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quran_pdf TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_pdf TO authenticated;
GRANT ALL ON public.quran_pdf TO service_role;
ALTER TABLE public.quran_pdf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read quran pdf" ON public.quran_pdf FOR SELECT USING (true);
CREATE POLICY "Admins manage quran pdf" ON public.quran_pdf FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER quran_pdf_updated_at BEFORE UPDATE ON public.quran_pdf
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ daily_verse ============
CREATE TABLE public.daily_verse (
  id text PRIMARY KEY DEFAULT 'default',
  reference text NOT NULL DEFAULT '',
  arabic text NOT NULL DEFAULT '',
  translation jsonb NOT NULL DEFAULT '{"en":"","te":"","ur":""}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_verse TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_verse TO authenticated;
GRANT ALL ON public.daily_verse TO service_role;
ALTER TABLE public.daily_verse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read daily verse" ON public.daily_verse FOR SELECT USING (true);
CREATE POLICY "Admins manage daily verse" ON public.daily_verse FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER daily_verse_updated_at BEFORE UPDATE ON public.daily_verse
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ daily_hadith ============
CREATE TABLE public.daily_hadith (
  id text PRIMARY KEY DEFAULT 'default',
  source text NOT NULL DEFAULT '',
  arabic text NOT NULL DEFAULT '',
  text jsonb NOT NULL DEFAULT '{"en":"","te":"","ur":""}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_hadith TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_hadith TO authenticated;
GRANT ALL ON public.daily_hadith TO service_role;
ALTER TABLE public.daily_hadith ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read daily hadith" ON public.daily_hadith FOR SELECT USING (true);
CREATE POLICY "Admins manage daily hadith" ON public.daily_hadith FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER daily_hadith_updated_at BEFORE UPDATE ON public.daily_hadith
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ seed ============
INSERT INTO public.prayer_times (id, times, jumuah_khutbah) VALUES (
  'default',
  '{"fajr":"05:02","sunrise":"06:18","dhuhr":"13:05","asr":"16:45","maghrib":"18:41","isha":"20:15","jumuah":"13:30"}'::jsonb,
  '13:15'
);

INSERT INTO public.about_masjid (id, summary, full_text) VALUES (
  'default',
  jsonb_build_object(
    'en', 'Masjid-e-Meraj opens its doors to worshippers, students and neighbours alike — daily prayers, Jumu''ah, Quran classes and community services.',
    'te', 'మస్జిద్-ఎ-మెరాజ్ ఆరాధకులకు, విద్యార్థులకు మరియు పొరుగువారికి స్వాగతం — రోజువారీ నమాజ్, జుమా, ఖురాన్ తరగతులు మరియు సమాజ సేవలు.',
    'ur', 'مسجدِ معراج نمازیوں، طلبہ اور اہلِ محلہ کے لیے کھلی ہے — پنجگانہ نماز، جمعہ، قرآن کلاسز اور خدمتِ خلق۔'
  ),
  jsonb_build_object(
    'en', 'Masjid-e-Meraj opens its doors to worshippers, students and neighbours alike. Our halls host the five daily prayers, the weekly Jumu''ah khutbah, Quran and Arabic classes, and services that support families across the city.

The masjid was built by the local community and continues to be maintained by it. Beyond prayer, we run children''s maktab classes, weekly tafsir and hadith circles, marriage and funeral services, and Ramadan iftar for the neighbourhood.

Visitors of every background are welcome.',
    'te', 'మస్జిద్-ఎ-మెరాజ్ ఆరాధకులకు, విద్యార్థులకు మరియు పొరుగువారికి స్వాగతం. ఇక్కడ ఐదు పూటల నమాజ్, జుమా ఖుత్బా, ఖురాన్ మరియు అరబిక్ తరగతులు, సమాజ సేవలు నిర్వహిస్తారు.

మస్జిద్ స్థానిక సమాజం ద్వారా నిర్మించబడింది మరియు నిర్వహించబడుతోంది. పిల్లల మక్తబ్, వారపు తఫ్సీర్ మరియు హదీస్ సభలు, వివాహ మరియు అంత్యక్రియ సేవలు, రమదాన్ ఇఫ్తార్ కూడా అందిస్తున్నాము.

అందరికీ స్వాగతం.',
    'ur', 'مسجدِ معراج نمازیوں، طلبہ اور اہلِ محلہ کے لیے کھلی ہے۔ یہاں پنجگانہ نماز، جمعہ کا خطبہ، قرآن و عربی کی کلاسز اور خدمتِ خلق کے کام ہوتے ہیں۔

مسجد مقامی اہلِ محلہ نے بنائی اور وہی اس کی دیکھ بھال کرتے ہیں۔ بچوں کا مکتب، ہفتہ وار درسِ تفسیر و حدیث، نکاح و جنازہ کی خدمات اور رمضان میں افطار کا اہتمام بھی ہوتا ہے۔

ہر ایک کو خوش آمدید۔'
  )
);

INSERT INTO public.settings (id, contact, location, basics) VALUES (
  'default',
  '{"phone":"+91 90000 00000","whatsapp":"+91 90000 00000","email":"info@masjidemeraj.org","website":"https://masjidemeraj.org","facebook":"","instagram":"","youtube":""}'::jsonb,
  '{"name":"Masjid-e-Meraj","address":"Masjid-e-Meraj, Hyderabad, Telangana, India","latitude":"17.3850","longitude":"78.4867","mapsUrl":""}'::jsonb,
  '[
    {"id":"pillars","icon":"pillars","title":{"en":"Five Pillars of Islam","te":"ఇస్లాం ఐదు మూల స్తంభాలు","ur":"اسلام کے پانچ ارکان"},"body":{"en":"Shahadah (faith), Salah (prayer), Zakat (charity), Sawm (fasting in Ramadan) and Hajj (pilgrimage).","te":"షహాదా (విశ్వాసం), నమాజ్, జకాత్ (దానం), రోజా (ఉపవాసం) మరియు హజ్ (యాత్ర).","ur":"شہادت، نماز، زکوٰۃ، روزہ اور حج۔"}},
    {"id":"faith","icon":"faith","title":{"en":"Six Articles of Faith","te":"విశ్వాసపు ఆరు మూలాంశాలు","ur":"ایمان کے چھ ارکان"},"body":{"en":"Belief in Allah, His angels, His books, His messengers, the Last Day and divine decree.","te":"అల్లాహ్, దైవదూతలు, గ్రంథాలు, ప్రవక్తలు, తీర్పు దినం మరియు దైవ నిర్ణయంపై విశ్వాసం.","ur":"اللہ، فرشتوں، کتابوں، رسولوں، آخرت اور تقدیر پر ایمان۔"}},
    {"id":"wudu","icon":"wudu","title":{"en":"How to Perform Wudu","te":"వుజూ ఎలా చేయాలి","ur":"وضو کیسے کریں"},"body":{"en":"Wash the hands, rinse the mouth and nose, wash the face and arms, wipe the head, then wash the feet.","te":"చేతులు, నోరు, ముక్కు కడిగి, ముఖం మరియు చేతులు కడిగి, తలపై తుడిచి, పాదాలు కడగాలి.","ur":"ہاتھ دھوئیں، کلی کریں، ناک صاف کریں، چہرہ اور بازو دھوئیں، سر کا مسح کریں، پھر پاؤں دھوئیں۔"}},
    {"id":"salah","icon":"salah","title":{"en":"How to Pray Salah","te":"నమాజ్ ఎలా చేయాలి","ur":"نماز کیسے پڑھیں"},"body":{"en":"Face the Qiblah, make the intention, then pray with takbir, recitation, ruku, sujud and tasleem.","te":"ఖిబ్లా వైపు తిరిగి, సంకల్పం చేసి, తక్బీర్, ఖిరాఅత్, రుకూ, సజ్దా మరియు సలామ్‌తో నమాజ్ చేయండి.","ur":"قبلہ رُخ ہو کر نیت کریں، پھر تکبیر، قراءت، رکوع، سجدہ اور سلام کے ساتھ نماز ادا کریں۔"}},
    {"id":"ramadan","icon":"ramadan","title":{"en":"Ramadan","te":"రమదాన్","ur":"رمضان"},"body":{"en":"The blessed month of fasting, night prayers, Quran recitation and generosity to those in need.","te":"ఉపవాసం, తరావీహ్, ఖురాన్ పఠనం మరియు దానధర్మాల శుభ మాసం.","ur":"روزے، تراویح، تلاوتِ قرآن اور سخاوت کا مبارک مہینہ۔"}},
    {"id":"zakat","icon":"zakat","title":{"en":"Zakat","te":"జకాత్","ur":"زکوٰۃ"},"body":{"en":"An annual purification of wealth — 2.5% of savings given to the poor and those in need.","te":"సంపద శుద్ధి — పొదుపులో 2.5% పేదలకు ఇవ్వడం.","ur":"مال کی سالانہ پاکیزگی — بچت کا 2.5 فیصد مستحقین کو دینا۔"}},
    {"id":"hajj","icon":"hajj","title":{"en":"Hajj","te":"హజ్","ur":"حج"},"body":{"en":"The pilgrimage to Makkah, obligatory once in a lifetime for those who are able.","te":"శక్తి ఉన్నవారికి జీవితంలో ఒకసారి తప్పనిసరి అయిన మక్కా యాత్ర.","ur":"مکہ کا سفر، صاحبِ استطاعت پر زندگی میں ایک بار فرض۔"}}
  ]'::jsonb
);

INSERT INTO public.quran_pdf (id, url, name) VALUES ('default', '', '');

INSERT INTO public.daily_verse (id, reference, arabic, translation) VALUES (
  'default',
  'Surah Al-Qamar 54:17',
  'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
  jsonb_build_object(
    'en', 'And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?',
    'te', 'మేము ఖురాన్‌ను జ్ఞాపకం చేసుకోవడానికి సులభతరం చేశాము. అయితే గుర్తు చేసుకునే వారు ఎవరైనా ఉన్నారా?',
    'ur', 'اور بےشک ہم نے قرآن کو یاد رکھنے کے لیے آسان کر دیا، تو ہے کوئی نصیحت حاصل کرنے والا؟'
  )
);

INSERT INTO public.daily_hadith (id, source, arabic, text) VALUES (
  'default',
  'Sahih al-Bukhari',
  'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
  jsonb_build_object(
    'en', 'The Prophet ﷺ said: The best of you are those who learn the Quran and teach it.',
    'te', 'ప్రవక్త ﷺ చెప్పారు: మీలో ఉత్తములు ఖురాన్ నేర్చుకుని, ఇతరులకు నేర్పేవారు.',
    'ur', 'نبی ﷺ نے فرمایا: تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔'
  )
);

INSERT INTO public.announcements (position, date_label, title, body) VALUES
(0, 'Every Thursday',
 '{"en":"Weekly Tafsir Circle","te":"వారపు తఫ్సీర్ సభ","ur":"ہفتہ وار درسِ تفسیر"}'::jsonb,
 '{"en":"Join us every Thursday after Isha for a reflective study of Surah Al-Kahf in the main prayer hall.","te":"ప్రతి గురువారం ఇషా తర్వాత సూరహ్ అల్-కహ్ఫ్ అధ్యయనానికి ప్రధాన హాల్‌లో చేరండి.","ur":"ہر جمعرات نمازِ عشاء کے بعد سورۃ الکہف کے درس میں شریک ہوں۔"}'::jsonb),
(1, 'Open now',
 '{"en":"Quran Classes Registration Open","te":"ఖురాన్ తరగతుల నమోదు ప్రారంభం","ur":"قرآن کلاسز میں داخلہ جاری"}'::jsonb,
 '{"en":"Tajweed and hifz classes for children and adults. Please register at the front desk.","te":"పిల్లలు మరియు పెద్దల కోసం తజ్వీద్ మరియు హిఫ్జ్ తరగతులు. కార్యాలయంలో నమోదు చేసుకోండి.","ur":"بچوں اور بڑوں کے لیے تجوید و حفظ کی کلاسز۔ دفتر میں اندراج کروائیں۔"}'::jsonb),
(2, 'Fridays',
 '{"en":"Jumu''ah Parking Notice","te":"జుమా పార్కింగ్ సూచన","ur":"جمعہ پارکنگ اطلاع"}'::jsonb,
 '{"en":"Kindly use the rear courtyard parking on Fridays and avoid blocking neighbouring driveways.","te":"శుక్రవారాల్లో వెనుక ప్రాంగణ పార్కింగ్ ఉపయోగించండి; పొరుగువారి దారులను అడ్డుకోవద్దు.","ur":"جمعہ کے دن پچھلے صحن کی پارکنگ استعمال کریں اور ہمسایوں کے راستے بند نہ کریں۔"}'::jsonb);
