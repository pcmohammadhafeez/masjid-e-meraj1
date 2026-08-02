import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Bootstraps the very first administrator.
 *
 * The masjid committee creates one account on the hidden /admin page; the first
 * signed-in user (and only the first) is granted the `admin` role. Everyone
 * after that stays a read-only visitor until an existing admin adds them.
 */
export const claimAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const existing = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (existing.error) throw new Error(existing.error.message);
    if ((existing.count ?? 0) > 0) return { claimed: false as const };

    const inserted = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (inserted.error) throw new Error(inserted.error.message);

    return { claimed: true as const };
  });
