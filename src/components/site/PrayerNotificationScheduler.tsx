import { useEffect } from "react";
import { useContent } from "@/lib/content";

const STORAGE_KEY =
  "masjid-e-meraj-notification-settings";

type NotificationSettings = {
  enabled: Record<string, boolean>;
  minutesBefore: number;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  },
  minutesBefore: 5,
};

function loadSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(saved);

    return {
      enabled: {
        ...DEFAULT_SETTINGS.enabled,
        ...(parsed.enabled ?? {}),
      },
      minutesBefore:
        Number(parsed.minutesBefore) >= 1
          ? Number(parsed.minutesBefore)
          : 5,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function prayerTimeToMinutes(
  value: string,
): number | null {
  const match =
    /^\s*(\d{1,2}):(\d{2})/.exec(value ?? "");

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function createNotificationKey(
  prayerKey: string,
  date: Date,
  minutesBefore: number,
) {
  return `masjid-e-meraj-notified-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${prayerKey}-${minutesBefore}`;
}

export function PrayerNotificationScheduler() {
  const { content, loading } = useContent();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!("Notification" in window)) {
      return;
    }

    let cancelled = false;

    const checkNotifications = () => {
      if (cancelled) {
        return;
      }

      if (Notification.permission !== "granted") {
        return;
      }

      const settings = loadSettings();

      const now = new Date();

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

      const prayers = [
        {
          key: "fajr",
          name: "Fajr",
          value: content.prayerTimes.fajr,
        },
        {
          key: "dhuhr",
          name: "Dhuhr",
          value: content.prayerTimes.dhuhr,
        },
        {
          key: "asr",
          name: "Asr",
          value: content.prayerTimes.asr,
        },
        {
          key: "maghrib",
          name: "Maghrib",
          value: content.prayerTimes.maghrib,
        },
        {
          key: "isha",
          name: "Isha",
          value: content.prayerTimes.isha,
        },
      ];

      for (const prayer of prayers) {
        if (!settings.enabled[prayer.key]) {
          continue;
        }

        const prayerMinutes =
          prayerTimeToMinutes(prayer.value);

        if (prayerMinutes === null) {
          continue;
        }

        const notificationMinutes =
          prayerMinutes -
          settings.minutesBefore;

        /*
         * Only notify during the exact minute.
         */
        if (
          currentMinutes !==
          notificationMinutes
        ) {
          continue;
        }

        const notificationKey =
          createNotificationKey(
            prayer.key,
            now,
            settings.minutesBefore,
          );

        if (
          localStorage.getItem(
            notificationKey,
          ) === "true"
        ) {
          continue;
        }

        localStorage.setItem(
          notificationKey,
          "true",
        );

        const notification =
          new Notification(
            `${prayer.name} Prayer`,
            {
              body: `${prayer.name} prayer is in ${settings.minutesBefore} minutes.`,
              icon: "/masjid-icon.svg",
              badge: "/masjid-icon.svg",
              tag: `masjid-${prayer.key}`,
            },
          );

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    };

    /*
     * Check immediately.
     */
    checkNotifications();

    /*
     * Check every 15 seconds.
     * This prevents missing the notification because
     * of a small timing difference.
     */
    const interval =
      window.setInterval(
        checkNotifications,
        15_000,
      );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [content, loading]);

  return null;
}