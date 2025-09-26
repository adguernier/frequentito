"use client";

import { useEffect, useState } from "react";
import { Navbar, NavbarContent, NavbarBrand, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { createClient } from "@/utils/supabase/client";

export const Menu = () => {
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", user.id)
        .single();
      if (!error) {
        const name = [data?.first_name, data?.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        setFullName(name || user.email || null);
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
          <NavbarItem className="text-sm opacity-80">
            <Link as={NextLink} color="foreground" href="/profile">
              {fullName}
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};
