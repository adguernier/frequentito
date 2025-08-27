"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import webpush from "web-push";
import { createAdminClient } from "@/utils/supabase/admin";
import z from "zod";

const PresenceSchema = z.object({
  am: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  pm: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  day: z.string().optional(), // YYYY-MM-DD
  note: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type PresenceActionState =
  | { ok: true; debug?: unknown }
  | { error: string; debug?: unknown }
  | undefined;

export async function upsertPresence(
  _state: PresenceActionState,
  formData: FormData
): Promise<PresenceActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const parsed = PresenceSchema.safeParse({
    am: formData.get("am")?.toString(),
    pm: formData.get("pm")?.toString(),
    day: formData.get("day")?.toString(),
    note: formData.get("note")?.toString(),
  });

  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const { am, pm, day, note } = parsed.data;

  const { error, data } = await supabase.rpc("upsert_my_presence", {
    p_day: day ?? null,
    p_am: am ?? false,
    p_pm: pm ?? false,
    p_note: note ?? null,
  });

  if (error)
    return {
      error: error.message,
      debug: {
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      },
    };

  // Send push notifications to teammates (use admin client to bypass RLS)
  try {
    const meta = user.user_metadata as {
      first_name?: string;
      last_name?: string;
    } | null;
    const actor = meta?.first_name
      ? `${meta.first_name}${meta?.last_name ? " " + meta.last_name : ""}`
      : "A teammate";

    const admin = createAdminClient();
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id");

    const title = "Presence updated";
    const body = `${actor} is ${am || pm ? `${am ? "here in the morning" : ""}${am && pm ? " and " : ""}${pm ? "here in the afternoon" : ""}` : "not coming today"}.`;

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const privateKey = process.env.VAPID_PRIVATE_KEY!;
    const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      await Promise.all(
        (subs || [])
          .filter((s) => s.user_id !== user.id) // don't notify self
          .map(async (s) => {
            try {
              await webpush.sendNotification(
                {
                  endpoint: s.endpoint,
                  keys: { p256dh: s.p256dh, auth: s.auth },
                } as any,
                JSON.stringify({
                  title,
                  body,
                  data: { url: "/" },
                })
              );
            } catch (e) {
              // ignore subscription errors
            }
          })
      );
    }
  } catch {}

  revalidatePath("/", "page");
  return { ok: true, debug: data };
}
