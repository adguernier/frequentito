import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";

export type PresenceData = {
  user_id: string;
  am: boolean;
  pm: boolean;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type PresenceListProps = {
  presences: PresenceData[];
  isLoading?: boolean;
  error?: string | null;
};

export default function PresenceList({
  presences,
  isLoading = false,
  error,
}: PresenceListProps) {
  if (isLoading) {
    return <p className="text-foreground-500 text-sm">Loading presences...</p>;
  }

  if (error) {
    return <p className="text-foreground-500 text-sm">Failed to load list.</p>;
  }

  if (presences.length === 0) {
    return (
      <p className="text-foreground-500 text-sm">
        No one has shared their presence yet.
      </p>
    );
  }

  return (
    <ul
      className="divide-y divide-default-200 w-full bg-content1 rounded-lg overflow-hidden"
      data-testid="presence-list"
    >
      {presences.map((presence) => {
        const fullName =
          presence.profiles?.first_name || presence.profiles?.last_name
            ? `${presence.profiles?.first_name ?? ""}${
                presence.profiles?.first_name && presence.profiles?.last_name
                  ? " "
                  : ""
              }${presence.profiles?.last_name ?? ""}`
            : "Unnamed teammate";
        const avatarUrl = presence.profiles?.avatar_url || null;
        const isNotComing = !presence.am && !presence.pm;

        return (
          <li
            key={presence.user_id}
            className={`flex items-center justify-between p-3 ${
              isNotComing ? "opacity-50" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              {avatarUrl ? (
                <Avatar
                  src={avatarUrl}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <Avatar name={fullName} className="w-8 h-8" />
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
              {isNotComing && (
                <Chip size="sm" color="default" variant="flat">
                  Not coming
                </Chip>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
