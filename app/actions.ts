"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
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

export type PresenceActionState = { ok: true } | { error: string } | undefined;

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

  const { error } = await supabase.rpc("upsert_my_presence", {
    p_day: day ?? null,
    p_am: am ?? false,
    p_pm: pm ?? false,
    p_note: note ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "page");
  return { ok: true };
}
