"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
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
    });
  }, []);

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
              {notificationsEnabled !== null && (
                <span className="flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 border bg-default-100 text-default-600">
                  {notificationsEnabled ? (
                    <BellOnIcon className="text-success-500" />
                  ) : (
                    <BellOffIcon className="text-default-400" />
                  )}
                  {notificationsEnabled ? "On" : "Off"}
                </span>
              )}
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};
