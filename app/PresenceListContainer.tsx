import { createClient } from "@/utils/supabase/server";
import type { PresenceData } from "@/components/PresenceList";
import { RealtimePresenceList } from "./RealtimePresenceList";

export default async function PresenceListContainer() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("presences")
    .select("user_id, am, pm, profiles(first_name,last_name,avatar_url)")
    .eq("day", today);

  const presences = (data as PresenceData[] | null) ?? [];
  const errorMessage = error ? "Failed to load presences" : null;

  return <RealtimePresenceList presences={presences} error={errorMessage} />;
}
