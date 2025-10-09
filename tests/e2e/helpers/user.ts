import { supabase } from "./supabaseClient";

// Helper to get user ID from seeded users (user1@marmelab.com, etc.)
export async function getUserId(email: string) {
  const { data } = await supabase.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === email);
  return user?.id;
}
