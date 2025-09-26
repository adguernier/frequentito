"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar, NavbarContent, NavbarBrand, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { createClient } from "@/utils/supabase/client";
import { BellOnIcon, BellOffIcon } from "./icons";

export const Menu = () => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<
    boolean | null
  >(null);

  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name,last_name,notifications_enabled")
      .eq("id", user.id)
      .single();
    if (!error) {
      const name = [data?.first_name, data?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      setFullName(name || user.email || null);
      if (typeof data?.notifications_enabled === "boolean") {
        setNotificationsEnabled(data.notifications_enabled);
      }
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleNotifications = useCallback(async () => {
    if (notificationsEnabled === null || toggling) return;
    setError(null);
    setToggling(true);
    const supabase = createClient();
    const next = !notificationsEnabled;
    // optimistic update
    setNotificationsEnabled(next);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setToggling(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ notifications_enabled: next })
      .eq("id", user.id);
    if (error) {
      // revert on failure
      setNotificationsEnabled(!next);
      setError("Failed to update notifications");
    }
    setToggling(false);
  }, [notificationsEnabled, toggling]);

  return (
    <Navbar>
      <NavbarContent>
        <NavbarBrand>
          <p className="font-bold text-inherit">
            <Link as={NextLink} href="/">
              Frequentito
            </Link>
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        {fullName && (
          <NavbarItem className="text-sm opacity-80 flex items-center gap-2">
            <Link
              as={NextLink}
              color="foreground"
              href="/profile"
              className="flex items-center gap-2"
            >
              <span>{fullName}</span>
            </Link>
            {notificationsEnabled !== null && (
              <button
                type="button"
                onClick={toggleNotifications}
                disabled={toggling}
                className="cursor-pointer flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 border bg-default-100 text-default-600 hover:bg-default-200 transition-colors disabled:opacity-50"
                title={
                  toggling
                    ? "Updating..."
                    : notificationsEnabled
                      ? "Disable notifications"
                      : "Enable notifications"
                }
              >
                {notificationsEnabled ? (
                  <BellOnIcon className="text-success-500" />
                ) : (
                  <BellOffIcon className="text-default-400" />
                )}
                {toggling ? "..." : notificationsEnabled ? "On" : "Off"}
              </button>
            )}
          </NavbarItem>
        )}
        {error && (
          <NavbarItem>
            <span className="text-danger-500 text-xs">{error}</span>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};
