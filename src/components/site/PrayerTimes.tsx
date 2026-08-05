import { useEffect, useMemo, useState } from "react";
import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Star,
  Clock,
  CalendarDays,
  Timer,
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
  { key: "sunrise", arabic: "الشروق", Icon: Sunrise, secondary: true },
  { key: "dhuhr", arabic: "الظهر", Icon: Sun },
  { key: "asr", arabic: "العصر", Icon: CloudSun },
  { key: "maghrib", arabic: "المغرب", Icon: Sunset },
  { key: "isha", arabic: "العشاء", Icon: Moon },
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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatClock24(date: Date) {
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

/** Normalise a stored value to strict 24-hour "HH:MM" (no AM/PM). */
function to24h(value: string): string {
  const match = /^\s*(\d{1,2}):(\d{2})/.exec(value ?? "");
  if (!match) return "—";
  return `${pad(Number(match[1]))}:${match[2]}`;
}

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
  const mainKeys: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  const { nextKey, countdown } = useMemo(() => {
    if (!now) return { nextKey: null as PrayerKey | null, countdown: "--:--:--" };
    const secondsNow = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let next: PrayerKey = "fajr";
    let target: number | null = null;
    for (const key of mainKeys) {
      const mins = toMinutes(content.prayerTimes[key]);
      if (mins !== null && mins * 60 > secondsNow) {
        next = key;
        target = mins * 60;
        break;
      }
    }
    if (target === null) {
      const fajr = toMinutes(content.prayerTimes.fajr);
      target = fajr === null ? null : fajr * 60 + 86400;
    }
    if (target === null) return { nextKey: next, countdown: "--:--:--" };
    const diff = Math.max(0, target - secondsNow);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return { nextKey: next, countdown: `${pad(h)}:${pad(m)}:${pad(s)}` };
  }, [now, content.prayerTimes]);

  return (
    <section
      id="prayer-times"
      className="aurora geo-pattern scroll-mt-24 px-4 pb-10 pt-24 sm:px-8 sm:pb-14 sm:pt-28"
    >
      <div className="mx-auto max-w-5xl">
        {/* Title + countdown */}
        <Reveal>
          <div className="glass-card page-enter rounded-[2rem] p-5 sm:rounded-[2.25rem] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold">
                  {t("prayer.eyebrow")}
                </p>
                <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {t("prayer.title")}
                </h1>
              </div>
              <p className="font-arabic text-2xl text-gold sm:text-3xl">أوقات الصلاة</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-gold/30 bg-secondary/50 p-4 sm:p-5">
                <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Timer className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  Next {nextKey ? t(`prayer.${nextKey}`) : ""} in
                </p>
                <p className="mt-1 font-display text-[2.5rem] font-extrabold leading-none tabular-nums text-primary sm:text-[2.75rem]">
                  {countdown}
                </p>
              </div>
              <div className="rounded-3xl border border-gold/30 bg-secondary/50 p-4 sm:p-5">
                <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  {t("prayer.clock")}
                </p>
                <p className="mt-1 font-display text-[2.5rem] font-extrabold leading-none tabular-nums text-foreground sm:text-[2.75rem]">
                  {now ? formatClock24(now) : "--:--:--"}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
              ].map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="flex min-w-0 items-center gap-3 rounded-3xl border border-border/70 bg-card/50 px-4 py-3"
                >
                  <span
                    className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gold"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 break-words font-display text-base font-bold leading-snug text-foreground">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Big prayer tiles */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prayerMeta.map((prayer, i) => {
            const isNext = nextKey === prayer.key;
            return (
              <Reveal key={prayer.key} delay={i * 60}>
                <div
                  className={`prayer-tile h-full p-5 sm:p-6 ${isNext ? "prayer-tile-active" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-gold"
                      aria-hidden="true"
                    >
                      <prayer.Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    {isNext ? (
                      <span className="rounded-full border border-gold/60 bg-gold/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold">
                        Next
                      </span>
                    ) : prayer.secondary ? (
                      <span className="rounded-full border border-border px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Info
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                        {t(`prayer.${prayer.key}`)}
                      </p>
                      <p className="mt-1 font-arabic text-xl leading-none text-gold">
                        {prayer.arabic}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`mt-4 font-display text-[2.6rem] font-extrabold leading-none tracking-tight tabular-nums sm:text-[2.75rem] ${
                      prayer.secondary ? "text-muted-foreground" : "text-mint"
                    }`}
                  >
                    {to24h(content.prayerTimes[prayer.key])}
                  </p>
                </div>
              </Reveal>
            );
          })}

          {/* Jumu'ah — full width */}
          <Reveal delay={360} className="sm:col-span-2 lg:col-span-3">
            <div className="prayer-tile flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className="icon-chip grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-gold"
                  aria-hidden="true"
                >
                  <Star className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                    {t("prayer.jumuah")}
                  </p>
                  <p className="mt-1 font-arabic text-xl leading-none text-gold">الجمعة</p>
                </div>
              </div>
              <div className="text-end">
                <p className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight tabular-nums text-mint sm:text-[2.75rem]">
                  {to24h(content.prayerTimes.jumuah)}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  Khutbah {to24h(content.jumuahKhutbah)}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
