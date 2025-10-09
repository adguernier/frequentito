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

  // Update presences when initialPresences prop changes
  useEffect(() => {
    setPresences(initialPresences);
  }, [initialPresences]);

  useEffect(() => {
    const supabase = createClient();

    const updatePresences = async (payload: { new: PresenceData }) => {
      const updatedPresence = payload.new;

      try {
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
          const existingIndex = prev.findIndex(
            (p) => p.user_id === newPresence.user_id
          );
          if (existingIndex === -1) {
            // Add new presence
            return [...prev, newPresence];
          } else {
            // Update existing presence
            const updated = [...prev];
            updated[existingIndex] = newPresence;
            return updated;
          }
        });
      } catch (error) {
        console.error("Error updating presence:", error);
      }
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
