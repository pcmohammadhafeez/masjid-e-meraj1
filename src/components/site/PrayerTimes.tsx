import { useEffect, useState } from "react";
import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Star,
  Clock,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useContent, type PrayerKey } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

const prayerMeta: { key: PrayerKey; arabic: string; Icon: typeof Sun }[] = [
  { key: "fajr", arabic: "الفجر", Icon: Moon },
  { key: "sunrise", arabic: "الشروق", Icon: Sunrise },
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
    <section id="prayer-times" className="scroll-mt-24 gradient-sand py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2.5rem] surface-card">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/25 px-6 py-5 sm:px-9">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-emerald text-primary-foreground"
                  aria-hidden="true"
                >
                  <Clock className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-foreground">
                    {t("prayer.eyebrow")}
                  </p>
                  <h2 className="truncate font-display text-2xl font-semibold text-foreground">
                    {t("prayer.title")}
                  </h2>
                </div>
              </div>
              <span className="font-arabic text-2xl text-gold">أوقات الصلاة</span>
            </div>

            {/* Compact timetable */}
            <ul className="divide-y divide-gold/15">
              {prayerMeta.map((prayer) => (
                <li
                  key={prayer.key}
                  className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-secondary/60 sm:px-9"
                >
                  <prayer.Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                    {t(`prayer.${prayer.key}`)}
                  </span>
                  <span className="font-arabic text-base text-gold">{prayer.arabic}</span>
                  <span className="mx-2 hidden h-px flex-1 bg-gold/20 sm:block" aria-hidden="true" />
                  <span className="ms-auto text-end sm:ms-0">
                    <span className="font-display text-2xl font-semibold tabular-nums text-primary">
                      {content.prayerTimes[prayer.key]}
                    </span>
                    {prayer.key === "jumuah" && (
                      <span className="block text-[0.7rem] text-muted-foreground">
                        Khutbah {content.jumuahKhutbah}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {/* Date / Hijri / Clock strip */}
            <div className="grid gap-5 border-t border-gold/25 bg-secondary/50 px-6 py-6 sm:grid-cols-3 sm:px-9">
              {[
                {
                  Icon: CalendarDays,
                  label: t("prayer.today"),
                  value: now
                    ? new Intl.DateTimeFormat(locale, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(now)
                    : "—",
                },
                { Icon: Moon, label: t("prayer.hijri"), value: now ? formatHijri(now) : "—" },
                {
                  Icon: Clock,
                  label: t("prayer.clock"),
                  value: now ? formatClock(now) : "--:--:--",
                },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex min-w-0 items-center gap-4">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold text-gold-foreground"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold tabular-nums text-foreground">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-7 flex justify-center">
            <Button variant="gold" size="xl" asChild>
              <Link to="/resources">
                {t("hero.cta2")} <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
