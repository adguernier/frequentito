import { supabase } from "./supabaseClient";

export async function getUserData(email: string) {
  // Get user from auth system which contains profile information
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error(`Error fetching users:`, error);
    return null;
  }
  const user = data.users.find((u) => u.email === email);

  if (!user) {
    console.error(`User with email ${email} not found`);
    return null;
  }

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("first_name,last_name")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    console.error(`User with email ${email} not found`);
    return null;
  }
  return { ...userProfile, id: user.id };
}
