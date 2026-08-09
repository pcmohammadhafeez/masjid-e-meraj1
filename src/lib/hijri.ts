import type { Lang } from "@/lib/i18n";

/**
 * Hijri date formatting that never falls back to a Gregorian month.
 *
 * Some mobile browsers ship without the Islamic (Umm al-Qura) calendar. When
 * that happens `Intl` silently resolves to the Gregorian calendar and prints
 * e.g. "February" in the Hijri slot. We therefore only trust `Intl` when it
 * confirms the Islamic calendar, and otherwise compute the date ourselves.
 */

const MONTHS: Record<Lang, string[]> = {
  en: [
    "Muharram",
    "Safar",
    "Rabi al-Awwal",
    "Rabi al-Thani",
    "Jumada al-Awwal",
    "Jumada al-Thani",
    "Rajab",
    "Shaban",
    "Ramadan",
    "Shawwal",
    "Dhul Qadah",
    "Dhul Hijjah",
  ],
  te: [
    "ముహర్రం",
    "సఫర్",
    "రబీ అల్-అవ్వల్",
    "రబీ అల్-థానీ",
    "జుమాదా అల్-అవ్వల్",
    "జుమాదా అల్-థానీ",
    "రజబ్",
    "షాబాన్",
    "రమదాన్",
    "షవ్వాల్",
    "జుల్ ఖాదా",
    "జుల్ హిజ్జా",
  ],
  ur: [
    "محرم",
    "صفر",
    "ربیع الاول",
    "ربیع الثانی",
    "جمادی الاول",
    "جمادی الثانی",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذی القعدہ",
    "ذی الحجہ",
  ],
};

const AH_LABEL: Record<Lang, string> = {
  en: "AH",
  te: "హిజ్రీ",
  ur: "ھ",
};

type HijriParts = {
  day: number;
  /** 1-12 */
  month: number;
  year: number;
};

/** Reads the calendar date in India time, independent of the device zone. */
function indiaDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

/** Gregorian calendar date -> Julian Day Number. */
function toJulianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5
  );
}

/** Arithmetical (tabular) Islamic calendar — used only when Intl cannot help. */
function tabularHijri(date: Date): HijriParts {
  const { year, month, day } = indiaDateParts(date);
  const jd = Math.floor(toJulianDay(year, month, day)) + 1;

  const daysSinceEpoch = jd - 1948440 + 10632;
  const cycles = Math.floor((daysSinceEpoch - 1) / 10631);
  let remainder = daysSinceEpoch - 10631 * cycles + 354;

  const yearInCycle =
    Math.floor((10985 - remainder) / 5316) *
      Math.floor((50 * remainder) / 17719) +
    Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);

  remainder =
    remainder -
    Math.floor((30 - yearInCycle) / 15) *
      Math.floor((17719 * yearInCycle) / 50) -
    Math.floor(yearInCycle / 16) * Math.floor((15238 * yearInCycle) / 43) +
    29;

  const hijriMonth = Math.floor((24 * remainder) / 709);
  const hijriDay = remainder - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * cycles + yearInCycle - 30;

  return { day: hijriDay, month: hijriMonth, year: hijriYear };
}

/** Umm al-Qura via Intl, only when the engine really supports that calendar. */
function intlHijri(date: Date): HijriParts | null {
  try {
    const formatter = new Intl.DateTimeFormat(
      "en-US-u-ca-islamic-umalqura-nu-latn",
      {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      },
    );

    const calendar = formatter.resolvedOptions().calendar ?? "";

    if (!calendar.startsWith("islamic")) {
      return null;
    }

    const parts = formatter.formatToParts(date);
    const read = (type: string) =>
      Number(
        (parts.find((part) => part.type === type)?.value ?? "").replace(
          /\D/g,
          "",
        ),
      );

    const day = read("day");
    const month = read("month");
    const year = read("year");

    if (!day || !month || !year || month > 12) {
      return null;
    }

    return { day, month, year };
  } catch {
    return null;
  }
}

export function getHijriParts(date: Date): HijriParts {
  return intlHijri(date) ?? tabularHijri(date);
}

/** Example: "26 Safar 1448 AH" */
export function formatHijriDate(date: Date, lang: Lang = "en"): string {
  const { day, month, year } = getHijriParts(date);
  const names = MONTHS[lang] ?? MONTHS.en;
  const name = names[Math.min(Math.max(month, 1), 12) - 1];

  return `${day} ${name} ${year} ${AH_LABEL[lang] ?? AH_LABEL.en}`;
}
