import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Admin from "./Admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();
  if (!profile?.roles.includes("admin")) {
    redirect("/");
  }

  return <Admin />;
}
