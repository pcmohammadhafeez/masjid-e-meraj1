import { useEffect, useState } from "react";
import { Sunrise, Sun, CloudSun, Sunset, Moon, Star, Clock, CalendarDays } from "lucide-react";

import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { useContent, type PrayerKey } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

const prayerMeta: { key: PrayerKey; arabic: string; Icon: typeof Sun }[] = [
  { key: "fajr", arabic: "الفجر", Icon: Sunrise },
  { key: "sunrise", arabic: "الشروق", Icon: Sun },
  { key: "dhuhr", arabic: "الظهر", Icon: Sun },
  { key: "asr", arabic: "العصر", Icon: CloudSun },
  { key: "maghrib", arabic: "المغرب", Icon: Sunset },
  { key: "isha", arabic: "العشاء", Icon: Moon },
  { key: "jumuah", arabic: "الجمعة", Icon: Star },
];

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function formatClock(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatHijri(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

export function PrayerTimes() {
  const { content } = useContent();
  const { t, lang } = useI18n();
  const now = useNow();

  const locale = lang === "te" ? "te-IN" : lang === "ur" ? "ur-PK" : "en-GB";

  return (
    <section id="prayer-times" className="scroll-mt-24 gradient-sand py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          arabic="أوقات الصلاة"
          eyebrow={t("prayer.eyebrow")}
          title={t("prayer.title")}
          description={t("prayer.desc")}
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {prayerMeta.map((prayer, i) => (
            <Reveal as="li" key={prayer.key} delay={i * 70}>
              <div className="surface-card group h-full rounded-3xl p-7">
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary transition-colors group-hover:gradient-emerald group-hover:text-primary-foreground"
                    aria-hidden="true"
                  >
                    <prayer.Icon className="h-5 w-5" />
                  </span>
                  <span className="font-arabic text-2xl text-gold">{prayer.arabic}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-foreground">
                  {t(`prayer.${prayer.key}`)}
                </h3>
                <p className="mt-2 font-display text-4xl font-semibold tabular-nums text-primary">
                  {content.prayerTimes[prayer.key]}
                </p>
                <div className="gold-rule mt-6" aria-hidden="true" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {prayer.key === "jumuah"
                    ? `Khutbah ${content.jumuahKhutbah}`
                    : prayer.key === "sunrise"
                      ? "Shuruq"
                      : "Jama'ah"}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <div className="mt-10 grid gap-5 rounded-3xl glass-card p-7 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-emerald text-primary-foreground">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {t("prayer.today")}
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-foreground">
                  {now
                    ? new Intl.DateTimeFormat(locale, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(now)
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-gold-foreground">
                <Moon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {t("prayer.hijri")}
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-foreground">
                  {now ? formatHijri(now) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {t("prayer.clock")}
                </p>
                <p className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
                  {now ? formatClock(now) : "--:--:--"}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}