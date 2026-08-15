import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
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
  const now = new Date();
  const indiaTime = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).formatToParts(now);
  const get = (type: string) =>
    indiaTime.find(
      (part) => part.type === type,
    )?.value ?? "";
  const weekday = get("weekday");
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  if (weekday !== "Friday") {
    return res.status(200).json({
      success: true,
      sent: false,
      message: "Today is not Friday.",
    });
  }
  const currentMinutes =
    hour * 60 + minute;
  // Jumu'ah reminder at 1:10 PM.
  // Adjust this later if your mosque uses another time.
  const jumuahMinutes = 13 * 60 + 15;
  const difference =
    jumuahMinutes - currentMinutes;
  if (
    difference < 4 ||
    difference > 7
  ) {
    return res.status(200).json({
      success: true,
      sent: false,
      message:
        "Jumu'ah is not within the reminder window.",
      minutesUntil: difference,
    });
  }
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
        prayer: "Jumu'ah",
        minutesBefore: 5,
      }),
    },
  );
  const result =
    await response.json();
  return res.status(
    response.ok ? 200 : 500,
  ).json({
    success: response.ok,
    sent: response.ok,
    prayer: "Jumu'ah",
    result,
  });
}
