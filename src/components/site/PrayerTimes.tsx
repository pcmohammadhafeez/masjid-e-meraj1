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
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { useContent, type PrayerKey } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

const prayerMeta: {
  key: PrayerKey;
  arabic: string;
  Icon: typeof Sun;
  secondary?: boolean;
}[] = [
  { key: "fajr", arabic: "الفجر", Icon: Moon },
  { key: "dhuhr", arabic: "الظهر", Icon: Sun },
  { key: "asr", arabic: "العصر", Icon: CloudSun },
  { key: "maghrib", arabic: "المغرب", Icon: Sunset },
  { key: "isha", arabic: "العشاء", Icon: Moon },
  { key: "sunrise", arabic: "الشروق", Icon: Sunrise, secondary: true },
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
    <section id="prayer-times" className="scroll-mt-20 gradient-sand pb-6 pt-20 sm:pb-8 sm:pt-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2.5rem] surface-card">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/25 px-5 py-3.5 sm:px-9">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground"
                  aria-hidden="true"
                >
                  <Clock className="h-4 w-4" />
                </span>
                <h2 className="min-w-0 truncate font-display text-xl font-semibold text-foreground sm:text-2xl">
                  {t("prayer.title")}
                </h2>
              </div>
              <span className="font-arabic text-xl text-gold sm:text-2xl">أوقات الصلاة</span>
            </div>

            {/* Compact timetable */}
            <ul className="divide-y divide-gold/15">
              {prayerMeta.map((prayer) => (
                <li
                  key={prayer.key}
                  className={`flex items-center gap-3 transition-colors hover:bg-secondary/60 sm:px-9 ${
                    prayer.secondary ? "bg-secondary/40 px-5 py-1.5" : "px-5 py-2.5"
                  }`}
                >
                  <prayer.Icon
                    className={`shrink-0 text-gold ${prayer.secondary ? "h-3.5 w-3.5" : "h-4 w-4"}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`font-semibold uppercase tracking-[0.14em] ${
                      prayer.secondary
                        ? "text-xs text-muted-foreground"
                        : "text-sm text-foreground"
                    }`}
                  >
                    {t(`prayer.${prayer.key}`)}
                  </span>
                  <span
                    className={`font-arabic text-gold ${prayer.secondary ? "text-sm opacity-80" : "text-base"}`}
                  >
                    {prayer.arabic}
                  </span>
                  <span className="mx-2 hidden h-px flex-1 bg-gold/20 sm:block" aria-hidden="true" />
                  <span className="ms-auto text-end sm:ms-0">
                    <span
                      className={`font-display font-semibold tabular-nums ${
                        prayer.secondary ? "text-lg text-muted-foreground" : "text-2xl text-primary"
                      }`}
                    >
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
            <div className="grid gap-3 border-t border-gold/25 bg-secondary/50 px-5 py-4 sm:grid-cols-3 sm:gap-5 sm:px-9">
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
                <div key={label} className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gold text-gold-foreground"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 font-display text-base font-semibold tabular-nums text-foreground sm:text-lg">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
