import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ScrollText, Sparkles } from "lucide-react";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { QuranViewer } from "@/components/site/QuranViewer";
import { useContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/resources")({
  component: Resources,
  head: () => ({
    meta: [
      { title: "Islamic Resources | Masjid-e-Meraj" },
      {
        name: "description",
        content:
          "Daily Quran verse, daily hadith, basics of Islam and a built-in Quran PDF reader — in English, Telugu and Urdu.",
      },
      { property: "og:title", content: "Islamic Resources | Masjid-e-Meraj" },
      {
        property: "og:description",
        content:
          "Daily Quran verse, daily hadith, basics of Islam and the Quran PDF reader at Masjid-e-Meraj.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Resources() {
  const { content } = useContent();
  const { t, lang } = useI18n();

  const basics = [1, 2, 3, 4].map((n) => ({
    title: t(`basics.${n}.title`),
    body: t(`basics.${n}.body`),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent={false} />
      <main className="pt-28">
        <section className="gradient-sand py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="الموارد الإسلامية"
              eyebrow={t("res.eyebrow")}
              title={t("res.title")}
              description={t("res.desc")}
            />

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              <Reveal>
                <article className="surface-card h-full rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-emerald text-primary-foreground">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <h2 className="text-xl font-semibold text-foreground">{t("res.verse")}</h2>
                  </div>
                  <p className="mt-6 font-arabic text-2xl leading-loose text-primary" dir="rtl">
                    {content.dailyVerse.arabic}
                  </p>
                  <div className="gold-rule mt-6" aria-hidden="true" />
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {content.dailyVerse.translation[lang]}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-gold-foreground">
                    {content.dailyVerse.reference}
                  </p>
                </article>
              </Reveal>

              <Reveal delay={120}>
                <article className="surface-card h-full rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-gold-foreground">
                      <ScrollText className="h-5 w-5" />
                    </span>
                    <h2 className="text-xl font-semibold text-foreground">{t("res.hadith")}</h2>
                  </div>
                  <p className="mt-6 text-base leading-relaxed text-foreground">
                    {content.dailyHadith.text[lang]}
                  </p>
                  <div className="gold-rule mt-6" aria-hidden="true" />
                  <p className="mt-4 text-sm font-semibold text-gold-foreground">
                    {content.dailyHadith.source}
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              arabic="أساسيات الإسلام"
              eyebrow={t("res.eyebrow")}
              title={t("res.basics")}
            />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2">
              {basics.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 90}>
                  <div className="surface-card h-full rounded-3xl p-7">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="gradient-sand py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <QuranViewer />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}