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

    const updatePresences = async (payload: { new: PresenceData }) => {
      const updatedPresence = payload.new;

      const profiles = (
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", updatedPresence.user_id)
          .maybeSingle<{
            first_name: string | null;
            last_name: string | null;
            avatar_url: string | null;
          }>()
      ).data;

      const newPresence = { ...updatedPresence, profiles };

      setPresences((prev) => {
        if (!prev.find((p) => p.user_id === newPresence.user_id)) {
          return [...prev, newPresence];
        }
        return prev.map((presence) =>
          presence.user_id === newPresence.user_id
            ? newPresence
            : presence
        );
      });
    };

    const channel = supabase
      .channel("realtime presences")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "presences",
        },
        updatePresences
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "presences",
        },
        updatePresences
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <PresenceList presences={presences} {...rest} />;
}
