import { createServerClient } from "@supabase/ssr";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY; // fallback for local dev
  if (!serviceKey) throw new Error("Missing service role key for admin client");

  return createServerClient(url, serviceKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
