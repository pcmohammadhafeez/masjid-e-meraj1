import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VITE_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

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
    const {
      prayer = "Prayer",
      minutesBefore = 5,
    } = req.body ?? {};

    const {
      data: subscriptions,
      error,
    } = await supabase
      .from("push_subscriptions")
      .select(
        "id, endpoint, p256dh, auth",
      );

    if (error) {
      console.error(
        "Failed to load subscriptions:",
        error,
      );

      return res.status(500).json({
        error: "Failed to load subscriptions",
        details: error.message,
        code: error.code,
        hint: error.hint,
      });
    }

    if (!subscriptions?.length) {
      return res.status(200).json({
        success: true,
        sent: 0,
        removed: 0,
        message:
          "No subscriptions found",
      });
    }

    const payload = JSON.stringify({
      title: `${prayer} Prayer`,
      body: `${prayer} prayer is in ${minutesBefore} minutes.`,
      icon: "/masjid-icon.svg",
      badge: "/masjid-icon.svg",
      tag: `masjid-${String(
        prayer,
      ).toLowerCase()}`,
      url: "/",
    });

    let sent = 0;
    let removed = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint:
              subscription.endpoint,
            keys: {
              p256dh:
                subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );

        sent++;
      } catch (error: any) {
        console.error(
          "Push notification failed:",
          error,
        );

        if (
          error?.statusCode === 404 ||
          error?.statusCode === 410
        ) {
          const { error: deleteError } =
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq(
                "id",
                subscription.id,
              );

          if (!deleteError) {
            removed++;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      sent,
      removed,
    });
  } catch (error: any) {
    console.error(
      "Push sender error:",
      error,
    );

    return res.status(500).json({
      error: "Internal server error",
      details:
        error?.message ??
        "Unknown server error",
    });
  }
}