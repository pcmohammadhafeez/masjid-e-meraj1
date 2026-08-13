import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const PRAYERS = [
  { key: "fajr", name: "Fajr" },
  { key: "dhuhr", name: "Dhuhr" },
  { key: "asr", name: "Asr" },
  { key: "maghrib", name: "Maghrib" },
  { key: "isha", name: "Isha" },
] as const;

function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(
    value.trim(),
  );

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

function getIndiaTime(): {
  date: string;
  minutes: number;
} {
  const now = new Date();

  const parts = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).formatToParts(now);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));

  return {
    date: `${year}-${month}-${day}`,
    minutes: hour * 60 + minute,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const cronSecret = process.env.CRON_SECRET;

  if (
    cronSecret &&
    req.headers.authorization !==
      `Bearer ${cronSecret}`
  ) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const { date, minutes: currentMinutes } =
      getIndiaTime();

    // Get the current prayer times from Supabase.
    const { data, error } = await supabase
      .from("prayer_times")
      .select("times")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to load prayer times:",
        error,
      );

      return res.status(500).json({
        error: "Failed to load prayer times",
        details: error.message,
        code: error.code,
      });
    }

    if (!data?.times) {
      return res.status(404).json({
        error: "Prayer times not found",
      });
    }

    const times =
      data.times as Record<string, unknown>;

    // We check every minute.
    // A prayer is considered due when it is exactly
    // 5 minutes from the current India time.
    const targetMinutes =
      currentMinutes + 5;

    const prayerToSend = PRAYERS.find(
      (prayer) => {
        const raw = times[prayer.key];

        if (typeof raw !== "string") {
          return false;
        }

        const prayerMinutes =
          toMinutes(raw);

        return (
          prayerMinutes !== null &&
          prayerMinutes === targetMinutes
        );
      },
    );

    if (!prayerToSend) {
      return res.status(200).json({
        success: true,
        sent: false,
        date,
        currentMinutes,
        message:
          "No prayer is 5 minutes away.",
      });
    }

    // Prevent duplicate sends for the same prayer/day.
    const duplicateKey =
      `prayer:${date}:${prayerToSend.key}:5`;

    const { data: existing } =
      await supabase
        .from("push_notification_logs")
        .select("id")
        .eq("notification_key", duplicateKey)
        .maybeSingle();

    if (existing) {
      return res.status(200).json({
        success: true,
        sent: false,
        duplicate: true,
        prayer: prayerToSend.name,
        message:
          "Notification already sent.",
      });
    }

    // Send the notification.
    const baseUrl =
      `https://${req.headers.host}`;

    const response = await fetch(
      `${baseUrl}/api/push/send`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({
          prayer: prayerToSend.name,
          minutesBefore: 5,
        }),
      },
    );

    const result =
      await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error:
          "Push notification failed",
        result,
      });
    }

    // Record successful check/send.
    const { error: logError } =
      await supabase
        .from("push_notification_logs")
        .insert({
          notification_key:
            duplicateKey,
          prayer:
            prayerToSend.name,
          notification_date: date,
        });

    if (logError) {
      console.warn(
        "Could not create notification log:",
        logError,
      );
    }

    return res.status(200).json({
      success: true,
      sent: true,
      prayer: prayerToSend.name,
      minutesBefore: 5,
      date,
      result,
    });
  } catch (error: any) {
    console.error(
      "Prayer check error:",
      error,
    );

    return res.status(500).json({
      error:
        error?.message ??
        "Internal server error",
    });
  }
}
