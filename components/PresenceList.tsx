import { createClient } from "@/utils/supabase/server";
import { Chip } from "@heroui/chip";

type Row = {
  user_id: string;
  am: boolean;
  pm: boolean;
  // Supabase will return an array for embedded tables when no direct FK is defined
  profiles?: { first_name: string | null; last_name: string | null }[] | null;
};

export default async function PresenceList() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("presences")
    .select("user_id, am, pm, profiles(first_name,last_name)")
    .eq("day", today)
    .or("am.is.true,pm.is.true");

  if (error) {
    return <p className="text-foreground-500 text-sm">Failed to load list.</p>;
  }

  const items = (data as unknown as Row[] | null) ?? [];

  if (items.length === 0) {
    return (
      <p className="text-foreground-500 text-sm">
        No one has shared their presence yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-default-200 w-full bg-content1 rounded-lg overflow-hidden">
      {items.map((t) => {
        const profile =
          t.profiles && t.profiles.length > 0 ? t.profiles[0] : null;
        const fullName =
          profile?.first_name || profile?.last_name
            ? `${profile?.first_name ?? ""}${
                profile?.first_name && profile?.last_name ? " " : ""
              }${profile?.last_name ?? ""}`
            : "Unnamed teammate";
        return (
          <li key={t.user_id} className="flex items-center justify-between p-3">
            <span>{fullName}</span>
            <span className="flex gap-2">
              {t.am && (
                <Chip size="sm" color="primary" variant="solid">
                  AM
                </Chip>
              )}
              {t.pm && (
                <Chip size="sm" color="primary" variant="solid">
                  PM
                </Chip>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
