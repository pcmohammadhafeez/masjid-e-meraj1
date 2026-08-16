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
  RefreshCw,
} from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { useContent, type PrayerKey } from "@/lib/content";
import { PrayerNotificationSettings } from "@/components/site/PrayerNotificationSettings";
import { useI18n } from "@/lib/i18n";
import { formatHijriDate } from "@/lib/hijri";

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
    let timeoutId: number;

    const tick = () => {
      setNow(new Date());
      timeoutId = window.setTimeout(
        tick,
        1000 - (Date.now() % 1000),
      );
    };

    tick();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return now;
}
/** True only while the device has no network connection. */
function useIsOffline() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);

    sync();

    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return offline;
}

function formatClock(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = date.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;

  return `${pad(h12)}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )} ${h >= 12 ? "PM" : "AM"}`;
}

/** Formats a content-fetch timestamp for the offline "last updated" strip. */
function formatTimestamp(ts: number, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function formatHijri(date: Date, lang: "en" | "te" | "ur") {
  try {
    return formatHijriDate(date, lang);
  } catch {
    return "—";
  }
}

/** Convert stored HH:MM into readable 12-hour time. */
function to12h(
  value: string,
  key?: PrayerKey,
): { time: string; suffix: string } {
  const input = value.trim().toUpperCase();

  // Already contains AM/PM
  const twelveHour =
    /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/.exec(
      input,
    );

  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = twelveHour[2];
    const period = twelveHour[3];

    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    const h12 = hour % 12 === 0 ? 12 : hour % 12;

    return {
      time: `${h12}:${minute}`,
      suffix: period,
    };
  }

  // Already 24-hour format
  const twentyFourHour =
    /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(input);

  if (twentyFourHour) {
    let hour = Number(twentyFourHour[1]);
    const minute = twentyFourHour[2];

    const suffix = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 === 0 ? 12 : hour % 12;

    return {
      time: `${h12}:${minute}`,
      suffix,
    };
  }

  // Plain H:MM from Admin
  const plain =
    /^([1-9]|1[0-2]):([0-5]\d)$/.exec(input);

  if (!plain) {
    return {
      time: value || "—",
      suffix: "",
    };
  }

  let hour = Number(plain[1]);
  const minute = plain[2];

  if (
    key !== "fajr" &&
    key !== "sunrise"
  ) {
    if (hour !== 12) {
      hour += 12;
    }
  } else if (hour === 12) {
    hour = 0;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;

  return {
    time: `${h12}:${minute}`,
    suffix,
  };
}

/** Convert stored HH:MM into minutes since midnight. */
function toMinutes(
  value: string,
  key?: PrayerKey,
): number | null {
  const match =
    /^\s*(\d{1,2}):(\d{2})/.exec(value ?? "");

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  // Fajr and Sunrise are AM.
  // All main prayers after Fajr are PM.
  if (
    hours >= 1 &&
    hours <= 11 &&
    key !== "fajr" &&
    key !== "sunrise"
  ) {
    hours += 12;
  }

  if (hours === 12 && key === "fajr") {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function PrayerLoadingSkeleton() {
  return (
    <section
      id="prayer-times"
      className="particles scroll-mt-20 gradient-sand pb-6 pt-20 sm:pb-8 sm:pt-24"
      aria-busy="true"
      aria-label="Loading prayer times"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-5">
        <div className="overflow-hidden rounded-[2rem] surface-card sm:rounded-[2.5rem]">
          {/* Header skeleton */}
          <div className="flex items-center justify-between border-b border-gold/25 bg-secondary/40 px-5 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-gold/10" />
              <div className="h-6 w-32 animate-pulse rounded-full bg-foreground/10" />
            </div>

            <div className="h-6 w-24 animate-pulse rounded-full bg-foreground/10" />
          </div>

          {/* Prayer rows */}
          <div className="divide-y divide-gold/15">
            {prayerMeta.map((prayer, index) => (
              <div
                key={prayer.key}
                className={`flex items-center gap-3 px-5 sm:px-5 ${
                  prayer.secondary ? "py-2" : "py-2.5"
                }`}
              >
                <div
                  className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gold/10"
                  style={{
                    animationDelay: `${index * 70}ms`,
                  }}
                />

                <div className="min-w-0 flex-1">
                  <div className="h-3.5 w-20 animate-pulse rounded-full bg-foreground/10" />
                </div>

                <div className="h-4 w-14 animate-pulse rounded-full bg-foreground/10" />

                <div className="h-8 w-24 animate-pulse rounded-lg bg-mint/10" />
              </div>
            ))}
          </div>

          {/* Bottom skeleton */}
          <div className="grid gap-3 border-t border-gold/25 bg-secondary/60 px-3 py-2 sm:grid-cols-3 sm:px-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 animate-pulse rounded-xl bg-gold/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-foreground/10" />
                  <div className="h-4 w-28 animate-pulse rounded-full bg-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PrayerTimes() {
  const { content, loading, lastUpdated } = useContent();
  const { t, lang } = useI18n();
  const now = useNow();
  const offline = useIsOffline();

  /*
   * IMPORTANT:
   * Do not render default prayer data while Supabase is loading.
   * This removes the brief old-time flash when the website opens.
   */
  if (loading) {
    return <PrayerLoadingSkeleton />;
  }

  const locale =
    lang === "te"
      ? "te-IN"
      : lang === "ur"
        ? "ur-PK"
        : "en-GB";

  // The next upcoming prayer.
// Main prayers are interpreted in India time:
// Fajr = AM, Dhuhr/Asr/Maghrib/Isha = PM.
const mainKeys: PrayerKey[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

function prayerMinutes(
  key: PrayerKey,
  value: string,
): number | null {
  const input = value.trim().toUpperCase();

  // 12-hour format with AM/PM
  const twelveHour =
    /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/.exec(
      input,
    );

  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3];

    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    return hour * 60 + minute;
  }

  // 24-hour format such as 05:35, 13:05, 18:41
  const twentyFourHour =
    /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(input);

  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);

    return hour * 60 + minute;
  }

  // Plain H:MM entered from Admin without AM/PM.
  const plain =
    /^([1-9]|1[0-2]):([0-5]\d)$/.exec(input);

  if (!plain) {
    return null;
  }

  let hour = Number(plain[1]);
  const minute = Number(plain[2]);

  // Fajr is AM.
  if (key === "fajr") {
    if (hour === 12) {
      hour = 0;
    }
  } else {
    // Dhuhr, Asr, Maghrib and Isha are PM.
    if (hour !== 12) {
      hour += 12;
    }
  }

  return hour * 60 + minute;
}

let nextKey: PrayerKey | null = null;

if (now) {
  const nowMin =
    now.getHours() * 60 +
    now.getMinutes();

  const upcoming = mainKeys
    .map((key) => ({
      key,
      minutes: prayerMinutes(
        key,
        content.prayerTimes[key],
      ),
    }))
    .filter(
      (
        item,
      ): item is {
        key: PrayerKey;
        minutes: number;
      } =>
        item.minutes !== null &&
        item.minutes > nowMin,
    )
    .sort(
      (a, b) =>
        a.minutes - b.minutes,
    );

  // If all today's prayers have passed,
  // Fajr becomes the next prayer for tomorrow.
  nextKey =
    upcoming.length > 0
      ? upcoming[0].key
      : "fajr";
}

  return (
    <section
      id="prayer-times"
      className="particles scroll-mt-20 gradient-sand pb-6 pt-20 sm:pb-8 sm:pt-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-5">
        <Reveal>
          <div className="group overflow-hidden rounded-[2rem] surface-card shadow-soft transition-shadow duration-700 hover:shadow-lift sm:rounded-[2.5rem]">

            {/* Header */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden border-b border-gold/25 bg-secondary/40 px-5 py-4 sm:px-5">

              {/* Soft premium light sweep */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-gold/10 to-transparent blur-xl transition-transform duration-[1800ms] ease-out group-hover:translate-x-[430%]"
              />

              <div className="relative flex min-w-0 items-center gap-3">
                <span
                  className="icon-chip grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gold shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_18px_color-mix(in_oklab,var(--color-gold)_20%,transparent)]"
                  aria-hidden="true"
                >
                  <Clock className="h-4 w-4 icon-soft-pulse" />
                </span>

                <h2 className="text-gold-shimmer min-w-0 truncate font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {t("prayer.title")}
                </h2>
              </div>

              <span className="relative font-arabic text-lg text-foreground/85 transition-opacity duration-500 group-hover:text-gold sm:text-xl">
                أوقات الصلاة
              </span>
            </div>

            {/* Timetable */}
            <ul className="divide-y divide-gold/15">
              {prayerMeta.map((prayer, index) => {
                const isNext = nextKey === prayer.key;

                const displayTime = to12h(
  content.prayerTimes[prayer.key],
  prayer.key,
);

                return (
                  <li
                    key={prayer.key}
                    className={`
                      group/row relative flex min-h-[4.15rem] items-center gap-2 px-4
                      transition-all duration-500 ease-out
                      hover:bg-secondary/60
                      sm:px-5
                      ${prayer.secondary ? "py-2" : "py-2.5"}
                      ${isNext ? "next-prayer" : ""}
                    `}
                    style={{
                      animationDelay: `${index * 55}ms`,
                    }}
                  >
                    {/* Animated active indicator */}
                    {isNext && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-[2px] bg-gold shadow-[0_0_12px_color-mix(in_oklab,var(--color-gold)_70%,transparent)]"
                      />
                    )}

                    {/* Icon */}
                    <span
                      className={`
                        icon-chip relative grid shrink-0 place-items-center rounded-lg
                        transition-all duration-500
                        group-hover/row:scale-110
                        group-hover/row:rotate-[-3deg]
                        ${prayer.secondary
                          ? "h-7 w-7 text-gold/80"
                          : "h-8 w-8 text-gold"}
                        ${isNext ? "icon-ring" : ""}
                      `}
                      aria-hidden="true"
                    >
                      <prayer.Icon
                        className={`
                          transition-transform duration-500
                          ${prayer.secondary
                            ? "h-3.5 w-3.5"
                            : "h-4 w-4"}
                          ${
                            prayer.Icon === Moon
                              ? "icon-breathe"
                              : prayer.Icon === Sun ||
                                  prayer.Icon === Sunrise
                                ? "icon-spin-slow"
                                : "icon-soft-pulse"
                          }
                        `}
                      />
                    </span>

                    {/* Prayer name */}
                    <span className="min-w-0">
                      <span
                        className={`
                          block uppercase transition-colors duration-300
                          ${
                            prayer.secondary
                              ? "text-[0.7rem] font-medium tracking-[0.16em] text-muted-foreground"
                              : "text-sm font-bold tracking-[0.14em] text-foreground"
                          }
                          group-hover/row:text-gold
                        `}
                      >
                        {t(`prayer.${prayer.key}`)}
                      </span>

                      {isNext && (
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/15 px-2 py-px text-[0.55rem] font-bold uppercase tracking-[0.14em] text-gold shadow-[0_0_12px_color-mix(in_oklab,var(--color-gold)_12%,transparent)]">
                          <span className="h-1 w-1 animate-pulse rounded-full bg-gold" />
                          Next Prayer
                        </span>
                      )}
                    </span>

                    {/* Arabic */}
                    <span
                      className={`
                        w-[3.5rem] shrink-0 text-center font-arabic transition-colors duration-300
                        ${
                          prayer.secondary
                            ? "text-xs text-muted-foreground"
                            : "text-sm text-foreground/70"
                        }
                        group-hover/row:text-gold/90
                      `}
                    >
                      {prayer.arabic}
                    </span>

                    {/* Connecting line */}
                    <span
                      className="mx-2 hidden h-px flex-1 bg-gold/20 transition-all duration-500 group-hover/row:bg-gold/35 sm:block"
                      aria-hidden="true"
                    />

                    {/* Time */}
                    <span className="w-[6.5rem] text-end">
                      <span
                        className={`
                          font-clock block
                          transition-all duration-500
                          group-hover/row:translate-x-[-2px]
                          ${
                            prayer.secondary
                              ? "text-lg text-muted-foreground"
                              : "text-[1.7rem] text-mint sm:text-[1.9rem]"
                          }
                          ${
                            isNext
                              ? "drop-shadow-[0_0_12px_color-mix(in_oklab,var(--color-mint)_28%,transparent)]"
                              : ""
                          }
                        `}
                      >
                        {displayTime.time}

                        <span
                          className={`
                            ms-1 font-sans font-semibold tracking-wide
                            ${
                              prayer.secondary
                                ? "text-[0.6rem] text-muted-foreground"
                                : "text-[0.72rem] text-mint/85"
                            }
                          `}
                        >
                          {displayTime.suffix}
                        </span>
                      </span>

                      {prayer.key === "jumuah" && (
                        <span className="block text-[0.68rem] font-medium text-muted-foreground transition-colors duration-300 group-hover/row:text-foreground/75">
                          Khutbah{" "}
                          {to12h(content.jumuahKhutbah, "jumuah").time}{" "}
{to12h(content.jumuahKhutbah, "jumuah").suffix}
                        </span>
                      )}
                    </span>

<div className="ms-2 flex shrink-0 items-center">
</div>
                  </li>
                );
              })}
            </ul>

            {/* Date / Hijri / Live Clock */}
            <div className="grid gap-3 border-t border-gold/25 bg-secondary/60 px-3 py-2 sm:grid-cols-3 sm:gap-4 sm:px-5">
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
                {
                  Icon: Moon,
                  label: t("prayer.hijri"),
                  value: now
                    ? formatHijri(now, lang)
                    : "—",
                },
                {
                  Icon: Clock,
                  label: t("prayer.clock"),
                  value: now
                    ? formatClock(now)
                    : "--:--:--",
                },
              ].map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className={`group/meta prayer-meta-card flex min-w-0 items-center gap-2.5 ${
                    Icon === CalendarDays
                      ? "prayer-meta-today"
                      : Icon === Moon
                        ? "prayer-meta-hijri"
                        : "prayer-meta-clock"
                  }`}
                >
                  <span
                    className="icon-chip grid h-8 w-8 shrink-0 place-items-center rounded-xl text-gold transition-all duration-500 group-hover/meta:scale-105 group-hover/meta:shadow-[0_0_16px_color-mix(in_oklab,var(--color-gold)_18%,transparent)]"
                    aria-hidden="true"
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        Icon === Moon
                          ? "icon-breathe"
                          : "icon-soft-pulse"
                      }`}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      {label}
                    </p>

                    <p className="font-clock mt-0.5 break-words text-[0.95rem] leading-snug text-foreground transition-colors duration-300 group-hover/meta:text-gold sm:text-base">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {offline && lastUpdated ? (
              <div className="flex items-center justify-center gap-1.5 border-t border-gold/20 bg-secondary/50 px-5 py-2 sm:px-5">
                <RefreshCw
                  className="h-3 w-3 text-gold"
                  aria-hidden="true"
                />
                <span className="text-[0.7rem] font-semibold tracking-wide text-foreground/75">
                  {t("prayer.lastUpdated")}:{" "}
                  {formatTimestamp(lastUpdated, locale)}
                </span>
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
