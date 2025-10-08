import { test as base, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import "../../../envConfig"; // load local env vars

// Create a Supabase admin client using the service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ROLE_KEY!
);

// Lightweight logical reset before each test: clear tables we mutate in tests.
base.beforeEach(async () => {
  // Clear presences (most tests write here). Service role bypasses RLS.
  // Use a broad filter to match all rows; PostgREST requires a filter on delete.
  await supabase.from("presences").delete().not("id", "is", null);

  // Optional: clear push_subscriptions if your tests create web push subscriptions
  await supabase.from("push_subscriptions").delete().not("id", "is", null);

  // If you need a full reset including users, prefer a one-time db-reset in Makefile
  // before the Playwright run. Re-creating auth users on every test is slow.
});

export const test = base;
export { expect };
