import { supabase } from "../helpers/supabaseClient";

// Helper to create test presence data
export async function createPresenceForUser(
  userId: string,
  am = true,
  pm = false
) {
  const today = new Date().toISOString().split("T")[0];
  return await supabase.from("presences").insert({
    user_id: userId,
    day: today,
    am,
    pm,
  });
}
