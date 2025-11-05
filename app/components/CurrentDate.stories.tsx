import type { Meta, StoryObj } from "@storybook/react";
import { CurrentDate } from "./CurrentDate";

const meta = {
  title: "Components/CurrentDate",
  component: CurrentDate,
  parameters: {
    layout: "centered",
    a11y: {
      config: {
        rules: [
          {
            // Ensure contrast ratio meets WCAG 2.1 AA (4.5:1)
            id: "color-contrast",
            enabled: true,
          },
          {
            // Ensure semantic HTML is used
            id: "list",
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    initialDate: {
      control: "date",
      description: "Initial date from SSR (optional, defaults to new Date())",
    },
    locale: {
      control: "select",
      options: ["en-US", "fr-FR", "de-DE", "es-ES"],
      description: "Browser locale (optional, defaults to navigator.language)",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof CurrentDate>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with browser locale
 */
export const Default: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
  },
};

/**
 * Light theme variant
 */
export const LightTheme: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
  },
  parameters: {
    backgrounds: { default: "light" },
    theme: "light",
  },
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
  },
  parameters: {
    backgrounds: { default: "dark" },
    theme: "dark",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * English (US) locale
 */
export const EnglishUS: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
    locale: "en-US",
  },
};

/**
 * French locale
 */
export const French: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
    locale: "fr-FR",
  },
};

/**
 * German locale
 */
export const German: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
    locale: "de-DE",
  },
};

/**
 * Spanish locale
 */
export const Spanish: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
    locale: "es-ES",
  },
};

/**
 * Multiple locales side-by-side
 */
export const DifferentLocales: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CurrentDate
        initialDate={new Date("2025-11-05T12:00:00")}
        locale="en-US"
      />
      <CurrentDate
        initialDate={new Date("2025-11-05T12:00:00")}
        locale="fr-FR"
      />
      <CurrentDate
        initialDate={new Date("2025-11-05T12:00:00")}
        locale="de-DE"
      />
      <CurrentDate
        initialDate={new Date("2025-11-05T12:00:00")}
        locale="es-ES"
      />
    </div>
  ),
};

/**
 * With custom className
 */
export const WithCustomClass: Story = {
  args: {
    initialDate: new Date("2025-11-05T12:00:00"),
    className: "text-2xl font-bold text-blue-500",
  },
};
