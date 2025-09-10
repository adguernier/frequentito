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

import { Button } from "@heroui/button";
import { logout } from "@/app/actions";

export const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = ["Presences", "Profile"];
  const routes: Record<string, string> = {
    Presences: "/",
    Profile: "/profile",
  };

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
              as={NextLink}
              className="w-full text-xl"
              color={
                index === 2
                  ? "primary"
                  : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
              }
              href={routes[item] ?? "#"}
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <form action={logout} className="w-full">
            <Button
              type="submit"
              color="danger"
              variant="flat"
              className="w-full text-xl"
            >
              Log Out
            </Button>
          </form>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};
