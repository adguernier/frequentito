import { createClient } from "@/utils/supabase/server";
import ProfileForm from "@/app/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("first_name,last_name")
    .eq("id", user.id)
    .single();

  return (
    <ProfileForm
      first_name={data?.first_name ?? ""}
      last_name={data?.last_name ?? ""}
    />
  );
}
