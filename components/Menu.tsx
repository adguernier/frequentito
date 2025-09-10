"use client";

import { useState } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import NextLink from "next/link";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon } from "@/components/icons";
import { Button } from "@heroui/button";

export const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = ["Presences", "Profile", "Log Out"];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} className="fixed">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="cursor-pointer"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit">Frequentito</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarMenu className="mx-4 mt-2 flex flex-col items-center gap-4 py-4 text-xl">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full text-xl"
              color={
                index === 2
                  ? "primary"
                  : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};
