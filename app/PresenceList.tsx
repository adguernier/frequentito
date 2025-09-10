import { createClient } from "@/utils/supabase/server";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";

type Row = {
  user_id: string;
  am: boolean;
  pm: boolean;
  // Supabase will return an array for embedded tables when no direct FK is defined
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function PresenceList() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("presences")
    .select("user_id, am, pm, profiles(first_name,last_name,avatar_url)")
    .eq("day", today)
    .or("am.is.true,pm.is.true");

  if (error) {
    return <p className="text-foreground-500 text-sm">Failed to load list.</p>;
  }

  const presences = (data as unknown as Row[] | null) ?? [];

  if (presences.length === 0) {
    return (
      <p className="text-foreground-500 text-sm">
        No one has shared their presence yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-default-200 w-full bg-content1 rounded-lg overflow-hidden">
      {presences.map((presence) => {
        console.log(presence.profiles);
        const fullName =
          presence.profiles?.first_name || presence.profiles?.last_name
            ? `${presence.profiles?.first_name ?? ""}${
                presence.profiles?.first_name && presence.profiles?.last_name
                  ? " "
                  : ""
              }${presence.profiles?.last_name ?? ""}`
            : "Unnamed teammate";
        const avatarUrl = presence.profiles?.avatar_url || null;

        return (
          <li
            key={presence.user_id}
            className="flex items-center justify-between p-3"
          >
            <span className="flex items-center gap-3">
              {avatarUrl ? (
                <Avatar
                  src={avatarUrl}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <Avatar name={fullName} />
              )}
              <span>{fullName}</span>
            </span>
            <span className="flex gap-2">
              {presence.am && (
                <Chip size="sm" color="primary" variant="solid">
                  AM
                </Chip>
              )}
              {presence.pm && (
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
