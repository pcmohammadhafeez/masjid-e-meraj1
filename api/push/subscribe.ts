import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
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

  try {
    const { endpoint, keys } = req.body ?? {};

    if (
      typeof endpoint !== "string" ||
      !keys ||
      typeof keys.p256dh !== "string" ||
      typeof keys.auth !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid push subscription",
      });
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "endpoint",
        },
      );

    if (error) {
      console.error(
        "Supabase subscription error:",
        error,
      );

      return res.status(500).json({
        error: "Failed to save subscription",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Push subscription saved",
    });
  } catch (error) {
    console.error(
      "Push subscription error:",
      error,
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}