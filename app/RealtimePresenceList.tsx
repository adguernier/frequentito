"use client";

import { createClient } from "@/utils/supabase/client";
import PresenceList from "@/components/PresenceList";
import type {
  PresenceData,
  PresenceListProps,
} from "@/components/PresenceList";
import { useEffect, useState } from "react";

export function RealtimePresenceList(props: PresenceListProps) {
  const { presences: initialPresences, ...rest } = props;
  const [presences, setPresences] = useState<PresenceData[]>(initialPresences);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime presences")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "presences",
        },
        (payload) => {
          const newPresence = payload.new as PresenceData;
          setPresences((prev) => [...prev, newPresence]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "presences",
        },
        (payload) => {
          const updatedPresence = payload.new as PresenceData;
          setPresences((prev) =>
            prev.map((presence) =>
              presence.user_id === updatedPresence.user_id
                ? updatedPresence
                : presence
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "presences",
        },
        (payload) => {
          const deletedPresence = payload.old as PresenceData;
          setPresences((prev) =>
            prev.filter(
              (presence) => presence.user_id !== deletedPresence.user_id
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <PresenceList presences={presences} {...rest} />;
}
