export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Frequentito",
    description:
      "An application to inform teammates our presence in the office",
  navItems: [{}],
  navMenuItems: [
    {
      label: "Frequentito",
      href: "/",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "login",
      href: "/login",
    },
    {
      label: "Signup",
      href: "/signup",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
  },
};
