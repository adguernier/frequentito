"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Ensure UI updates and cookies are flushed, then go to login
  revalidatePath("/", "layout");
  redirect("/login");
}

const PasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
    next: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export type SetPasswordState = { error: string } | { ok: true } | undefined;

export async function setPassword(
  _state: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const supabase = await createClient();

  const parsed = PasswordSchema.safeParse({
    password: formData.get("password")?.toString() ?? "",
    confirm: formData.get("confirm")?.toString() ?? "",
    next: formData.get("next")?.toString(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const { password, next } = parsed.data;
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next || "/");
}

// Update current user's profile (first_name, last_name)
const ProfileSchema = z.object({
  first_name: z.string().trim().max(100).optional(),
  last_name: z.string().trim().max(100).optional(),
  avatar_url: z.url().max(500).optional(),
});

export type ProfileActionState = { ok: true } | { error: string } | undefined;

export async function updateProfile(
  _state: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = ProfileSchema.safeParse({
    first_name: formData.get("first_name")?.toString(),
    last_name: formData.get("last_name")?.toString(),
    // avatar_url: formData.get("avatar_url")?.toString(),
  });
  if (!parsed.success) return { error: "Invalid input." };

  const { first_name, last_name } = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({ first_name, last_name })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}
