import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  ScrollText,
  Landmark,
  HeartHandshake,
  Droplets,
  Moon,
  Coins,
  Compass,
} from "lucide-react";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { QuranReader } from "@/components/site/QuranReader";
import { Announcements } from "@/components/site/Announcements";
import { AboutSection } from "@/components/site/AboutSection";
import { ContactSection } from "@/components/site/ContactSection";
import { LocationSection } from "@/components/site/LocationSection";
import { useContent, type BasicTopic } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/resources")({
  component: Resources,
  head: () => ({
    meta: [
      { title: "Islamic Resources | Masjid-e-Meraj" },
      {
        name: "description",
        content:
          "Read the Quran in a built-in PDF reader, plus the daily Quran verse, daily hadith and the basics of Islam in English, Telugu and Urdu.",
      },
      { property: "og:title", content: "Islamic Resources | Masjid-e-Meraj" },
      {
        property: "og:description",
        content:
          "Quran PDF reader, daily verse, daily hadith and Islamic basics at Masjid-e-Meraj.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const icons: Record<BasicTopic["icon"], typeof Landmark> = {
  pillars: Landmark,
  faith: HeartHandshake,
  salah: BookOpen,
  wudu: Droplets,
  ramadan: Moon,
  zakat: Coins,
  hajj: Compass,
};

function Resources() {
  const { content } = useContent();
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent={false} />
      <main className="pt-28">
        <section className="gradient-sand py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="الموارد الإسلامية"
              eyebrow={t("res.eyebrow")}
              title={t("res.title")}
              description={t("res.desc")}
            />
            <Reveal className="mt-12">
              <QuranReader />
            </Reveal>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-2">
            <Reveal>
              <article className="surface-card h-full rounded-[2rem] p-8">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-2xl gradient-emerald on-emerald"
                    aria-hidden="true"
                  >
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold text-gold">{t("res.verse")}</h2>
                </div>
                <p className="mt-6 font-arabic text-2xl leading-loose text-mint" dir="rtl">
                  {content.dailyVerse.arabic}
                </p>
                <div className="gold-rule mt-6" aria-hidden="true" />
                <p className="mt-5 text-base leading-relaxed text-foreground/90">
                  {content.dailyVerse.translation[lang]}
                </p>
                <p className="mt-4 text-sm font-semibold tracking-wide text-muted-foreground">
                  {content.dailyVerse.reference}
                </p>
              </article>
            </Reveal>

            <Reveal delay={120}>
              <article className="surface-card h-full rounded-[2rem] p-8">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-2xl gradient-gold text-gold-foreground"
                    aria-hidden="true"
                  >
                    <ScrollText className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold text-gold">{t("res.hadith")}</h2>
                </div>
                {content.dailyHadith.arabic && (
                  <p className="mt-6 font-arabic text-2xl leading-loose text-mint" dir="rtl">
                    {content.dailyHadith.arabic}
                  </p>
                )}
                <p className="mt-5 text-base leading-relaxed text-foreground/90">
                  {content.dailyHadith.text[lang]}
                </p>
                <div className="gold-rule mt-6" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold tracking-wide text-muted-foreground">
                  {content.dailyHadith.source}
                </p>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="gradient-sand py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="أساسيات الإسلام"
              eyebrow={t("res.eyebrow")}
              title={t("res.basics")}
            />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.basics.map((item, i) => {
                const Icon = icons[item.icon] ?? Landmark;
                return (
                  <Reveal as="li" key={item.id} delay={i * 70}>
                    <div className="surface-card h-full rounded-[2rem] p-6 sm:p-7">
                      <span
                        className="grid h-11 w-11 place-items-center rounded-2xl bg-gold/15 text-gold"
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-5 text-lg font-bold text-gold">
                        {item.title[lang]}
                      </h3>
                      <div className="gold-rule mt-4" aria-hidden="true" />
                      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                        {item.body[lang]}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-3">
            <Announcements />
            <AboutSection />
            <LocationSection />
          </div>
        </section>

        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
