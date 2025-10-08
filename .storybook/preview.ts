import type { Preview } from "@storybook/nextjs-vite";
import React from "react";
import { HeroUIProvider } from "@heroui/system";
import "../styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) =>
      React.createElement(HeroUIProvider, null, React.createElement(Story)),
  ],
};

export default preview;
