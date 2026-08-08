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
  const h = date.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${h >= 12 ? "PM" : "AM"}`;
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

/** Convert a stored "HH:MM" 24h value into Indian 12-hour parts. */
function to12h(value: string): { time: string; suffix: string } {
  const match = /^\s*(\d{1,2}):(\d{2})/.exec(value ?? "");
  if (!match) return { time: value ?? "—", suffix: "" };
  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return { time: `${String(h12).padStart(2, "0")}:${minutes}`, suffix };
}

/** Minutes since midnight for a stored "HH:MM" value. */
function toMinutes(value: string): number | null {
  const match = /^\s*(\d{1,2}):(\d{2})/.exec(value ?? "");
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function PrayerTimes() {
  const { content } = useContent();
  const { t, lang } = useI18n();
  const now = useNow();

  const locale = lang === "te" ? "te-IN" : lang === "ur" ? "ur-PK" : "en-GB";

  // The next upcoming prayer (main prayers only, wraps to Fajr after Isha).
  const mainKeys: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  let nextKey: PrayerKey | null = null;
  if (now) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    nextKey =
      mainKeys.find((key) => {
        const mins = toMinutes(content.prayerTimes[key]);
        return mins !== null && mins > nowMin;
      }) ?? "fajr";
  }

  return (
    <section
      id="prayer-times"
      className="particles scroll-mt-20 gradient-sand pb-6 pt-20 sm:pb-8 sm:pt-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] surface-card sm:rounded-[2.5rem]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/25 bg-secondary/40 px-5 py-4 sm:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gold"
                  aria-hidden="true"
                >
                  <Clock className="h-4 w-4" />
                </span>
                <h2 className="text-gold-shimmer min-w-0 truncate font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {t("prayer.title")}
                </h2>
              </div>
              <span className="font-arabic text-lg text-foreground/85 sm:text-xl">أوقات الصلاة</span>
            </div>

            {/* Compact timetable */}
            <ul className="divide-y divide-gold/15">
              {prayerMeta.map((prayer) => {
                const isNext = nextKey === prayer.key;
                return (
                <li
                  key={prayer.key}
                  className={`flex items-center gap-3 px-5 transition-colors hover:bg-secondary/60 sm:px-8 ${
                    prayer.secondary ? "bg-secondary/45 py-2" : "py-2.5"
                  } ${isNext ? "next-prayer" : ""}`}
                >
                  <span
                    className={`icon-chip grid shrink-0 place-items-center rounded-lg ${
                      prayer.secondary
                        ? "h-7 w-7 text-gold/80"
                        : "h-8 w-8 text-gold"
                    } ${isNext ? "icon-ring" : ""}`}
                    aria-hidden="true"
                  >
                    <prayer.Icon
                      className={`${prayer.secondary ? "h-3.5 w-3.5" : "h-4 w-4"} ${
                        prayer.Icon === Moon
                          ? "icon-breathe"
                          : prayer.Icon === Sun || prayer.Icon === Sunrise
                            ? "icon-spin-slow"
                            : "icon-soft-pulse"
                      }`}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block uppercase ${
                        prayer.secondary
                          ? "text-[0.7rem] font-medium tracking-[0.16em] text-muted-foreground"
                          : "text-sm font-bold tracking-[0.14em] text-foreground"
                      }`}
                    >
                      {t(`prayer.${prayer.key}`)}
                    </span>
                    {isNext && (
                      <span className="mt-0.5 inline-block rounded-full border border-gold/50 bg-gold/15 px-2 py-px text-[0.55rem] font-bold uppercase tracking-[0.14em] text-gold">
                        Next Prayer
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-arabic ${
                      prayer.secondary
                        ? "text-xs text-muted-foreground"
                        : "text-sm text-foreground/70"
                    }`}
                  >
                    {prayer.arabic}
                  </span>
                  <span className="mx-2 hidden h-px flex-1 bg-gold/20 sm:block" aria-hidden="true" />
                  <span className="ms-auto min-w-[5.75rem] text-end sm:ms-0">
                    <span
                      className={`font-clock block ${
                        prayer.secondary
                          ? "text-lg text-muted-foreground"
                          : "text-[1.7rem] text-mint sm:text-[1.9rem]"
                      }`}
                    >
                      {to12h(content.prayerTimes[prayer.key]).time}
                      <span
                        className={`ms-1 font-sans font-semibold tracking-wide ${
                          prayer.secondary
                            ? "text-[0.6rem] text-muted-foreground"
                            : "text-[0.72rem] text-mint/85"
                        }`}
                      >
                        {to12h(content.prayerTimes[prayer.key]).suffix}
                      </span>
                    </span>
                    {prayer.key === "jumuah" && (
                      <span className="block text-[0.68rem] font-medium text-muted-foreground">
                        Khutbah {to12h(content.jumuahKhutbah).time}{" "}
                        {to12h(content.jumuahKhutbah).suffix}
                      </span>
                    )}
                  </span>
                </li>
                );
              })}
            </ul>

            {/* Date / Hijri / Clock strip */}
            <div className="grid gap-3 border-t border-gold/25 bg-secondary/60 px-5 py-4 sm:grid-cols-3 sm:gap-4 sm:px-8">
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
                <div key={label} className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="icon-chip grid h-8 w-8 shrink-0 place-items-center rounded-xl text-gold"
                    aria-hidden="true"
                  >
                    <Icon className={`h-3.5 w-3.5 ${Icon === Moon ? "icon-breathe" : "icon-soft-pulse"}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="font-clock mt-0.5 break-words text-[0.95rem] leading-snug text-foreground sm:text-base">
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
