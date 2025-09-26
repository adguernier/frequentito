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

// Update current user's profile (first_name, last_name, avatar & metadata)
const ProfileSchema = z.object({
  first_name: z.string().trim().max(100).optional().nullable(),
  last_name: z.string().trim().max(100).optional().nullable(),
  // avatar_url is now a loose optional string (can be storage public URL or relative path)
  avatar_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  avatar_width: z.coerce
    .number()
    .int()
    .positive()
    .max(4000)
    .optional()
    .nullable(),
  avatar_height: z.coerce
    .number()
    .int()
    .positive()
    .max(4000)
    .optional()
    .nullable(),
  avatar_color: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .transform((v) => (v ? (v.startsWith("#") ? v : `#${v}`) : null))
    .optional()
    .nullable(),
  avatar_remove: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .nullable(),
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

  const firstNameRaw = formData.get("first_name")?.toString() ?? null;
  const lastNameRaw = formData.get("last_name")?.toString() ?? null;
  const avatarUrlRaw = formData.get("avatar_url")?.toString() ?? "";
  const widthRaw = formData.get("avatar_width")?.toString() ?? "";
  const heightRaw = formData.get("avatar_height")?.toString() ?? "";
  const colorRaw = formData.get("avatar_color")?.toString() ?? "";
  const removeRaw = formData.get("avatar_remove")?.toString() ?? "false";

  const parsed = ProfileSchema.safeParse({
    first_name: firstNameRaw && firstNameRaw.length > 0 ? firstNameRaw : null,
    last_name: lastNameRaw && lastNameRaw.length > 0 ? lastNameRaw : null,
    avatar_url: avatarUrlRaw && avatarUrlRaw.length > 0 ? avatarUrlRaw : null,
    avatar_width: widthRaw && widthRaw.length > 0 ? widthRaw : undefined,
    avatar_height: heightRaw && heightRaw.length > 0 ? heightRaw : undefined,
    avatar_color: colorRaw && colorRaw.length > 0 ? colorRaw : undefined,
    avatar_remove: removeRaw,
  });
  if (!parsed.success) return { error: "Invalid input." };

  const {
    first_name,
    last_name,
    avatar_url,
    avatar_width,
    avatar_height,
    avatar_color,
    avatar_remove,
  } = parsed.data;

  const payload: Record<string, any> = {
    first_name: first_name ?? null,
    last_name: last_name ?? null,
  };

  if (avatar_remove) {
    payload.avatar_url = null;
    payload.avatar_width = null;
    payload.avatar_height = null;
    payload.avatar_color = null;
  } else if (avatar_url) {
    payload.avatar_url = avatar_url;
    if (avatar_width) payload.avatar_width = avatar_width;
    if (avatar_height) payload.avatar_height = avatar_height;
    if (avatar_color) payload.avatar_color = avatar_color;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}
