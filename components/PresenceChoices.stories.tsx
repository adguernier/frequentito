import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import React from "react";
import PresenceChoices from "./PresenceChoices";

const meta: Meta<typeof PresenceChoices> = {
  title: "Components/PresenceChoices",
  component: PresenceChoices,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A compound component for selecting presence choices with morning, afternoon, and not coming options.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Disables all choice buttons",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story showing all choices
export const Default: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceChoices {...args}>
        <PresenceChoices.MorningChoice
          selected={false}
          onToggle={() => console.log("Morning toggled")}
        />
        <PresenceChoices.AfternoonChoice
          selected={false}
          onToggle={() => console.log("Afternoon toggled")}
        />
        <PresenceChoices.NotComingButton
          selected={false}
          onToggle={() => console.log("Not coming toggled")}
        />
      </PresenceChoices>
    </div>
  ),
  play: async ({ canvas }) => {
    // Test that components render with expected labels
    await expect(canvas.getByText("In morning")).toBeInTheDocument();
    await expect(canvas.getByText("In afternoon")).toBeInTheDocument();
    await expect(canvas.getByText("Not coming")).toBeInTheDocument();

    // Test that buttons have correct role
    await expect(canvas.getByText("In morning")).toHaveRole("button");
    await expect(canvas.getByText("In afternoon")).toHaveRole("button");
    await expect(canvas.getByText("Not coming")).toHaveRole("button");

    // Test that buttons are not disabled when component is enabled
    await expect(canvas.getByText("In morning")).not.toBeDisabled();
    await expect(canvas.getByText("In afternoon")).not.toBeDisabled();
    await expect(canvas.getByText("Not coming")).not.toBeDisabled();
  },
};

// Story with morning selected
export const MorningSelected: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceChoices {...args}>
        <PresenceChoices.MorningChoice
          selected={true}
          onToggle={() => console.log("Morning toggled")}
        />
        <PresenceChoices.AfternoonChoice
          selected={false}
          onToggle={() => console.log("Afternoon toggled")}
        />
        <PresenceChoices.NotComingButton
          selected={false}
          onToggle={() => console.log("Not coming toggled")}
        />
      </PresenceChoices>
    </div>
  ),
  play: async ({ canvas }) => {
    const morningButton = canvas.getByText("In morning");
    const afternoonButton = canvas.getByText("In afternoon");
    const notComingButton = canvas.getByText("Not coming");

    // Test button color/appearance when selected vs unselected
    // Morning button should be selected (solid variant)
    await expect(morningButton).toHaveAttribute("aria-pressed", "true");

    // Other buttons should not be selected
    await expect(afternoonButton).toHaveAttribute("aria-pressed", "false");
    await expect(notComingButton).toHaveAttribute("aria-pressed", "false");
  },
};

// Story with afternoon selected
export const AfternoonSelected: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceChoices {...args}>
        <PresenceChoices.MorningChoice
          selected={false}
          onToggle={() => console.log("Morning toggled")}
        />
        <PresenceChoices.AfternoonChoice
          selected={true}
          onToggle={() => console.log("Afternoon toggled")}
        />
        <PresenceChoices.NotComingButton
          selected={false}
          onToggle={() => console.log("Not coming toggled")}
        />
      </PresenceChoices>
    </div>
  ),
};

// Test story for onToggle callback functionality
const mockMorningToggle = fn().mockImplementation(() => {
  console.log("Morning toggled");
});
const mockAfternoonToggle = fn().mockImplementation(() => {
  console.log("Afternoon toggled");
});
const mockNotComingToggle = fn().mockImplementation(() => {
  console.log("Not coming toggled");
});
export const CallbackTest: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <div className="w-96" data-testid="presence-choices-container">
      <PresenceChoices {...args}>
        <PresenceChoices.MorningChoice
          selected={false}
          onToggle={mockMorningToggle}
        />
        <PresenceChoices.AfternoonChoice
          selected={false}
          onToggle={mockAfternoonToggle}
        />
        <PresenceChoices.NotComingButton
          selected={false}
          onToggle={mockNotComingToggle}
        />
      </PresenceChoices>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    mockMorningToggle.mockClear();
    mockAfternoonToggle.mockClear();
    mockNotComingToggle.mockClear();

    const morningButton = canvas.getByText("In morning");
    const afternoonButton = canvas.getByText("In afternoon");
    const notComingButton = canvas.getByText("Not coming");

    // Test that clicking buttons triggers onToggle callbacks
    await userEvent.click(morningButton);
    await userEvent.click(afternoonButton);
    await userEvent.click(notComingButton);

    await expect(mockMorningToggle).toHaveBeenCalledTimes(1);
    await expect(mockAfternoonToggle).toHaveBeenCalledTimes(1);
    await expect(mockNotComingToggle).toHaveBeenCalledTimes(1);
  },
};

// Story with not coming selected
export const NotComing: Story = {
  args: {
    disabled: false,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceChoices {...args}>
        <PresenceChoices.MorningChoice
          selected={false}
          onToggle={() => console.log("Morning toggled")}
        />
        <PresenceChoices.AfternoonChoice
          selected={false}
          onToggle={() => console.log("Afternoon toggled")}
        />
        <PresenceChoices.NotComingButton
          selected={true}
          onToggle={() => console.log("Not coming toggled")}
        />
      </PresenceChoices>
    </div>
  ),
};

// Story showing disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceChoices {...args}>
        <PresenceChoices.MorningChoice
          selected={true}
          onToggle={() => console.log("Morning toggled")}
        />
        <PresenceChoices.AfternoonChoice
          selected={false}
          onToggle={() => console.log("Afternoon toggled")}
        />
        <PresenceChoices.NotComingButton
          selected={false}
          onToggle={() => console.log("Not coming toggled")}
        />
      </PresenceChoices>
    </div>
  ),
  play: async ({ canvas }) => {
    const morningButton = canvas.getByText("In morning");
    const afternoonButton = canvas.getByText("In afternoon");
    const notComingButton = canvas.getByText("Not coming");

    // Test that buttons appear disabled when component is disabled
    await expect(morningButton).toBeDisabled();
    await expect(afternoonButton).toBeDisabled();
    await expect(notComingButton).toBeDisabled();

    // Test that aria-pressed state is maintained even when disabled
    await expect(morningButton).toHaveAttribute("aria-pressed", "true");
    await expect(afternoonButton).toHaveAttribute("aria-pressed", "false");
    await expect(notComingButton).toHaveAttribute("aria-pressed", "false");

    // Test that disabled buttons have pointer-events: none (cannot be clicked)
    // We don't attempt to click them as they will throw an error due to pointer-events: none
    const morningStyle = window.getComputedStyle(morningButton);
    await expect(morningStyle.pointerEvents).toBe("none");
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    disabled: false,
  },
  render: (args) => {
    const [selections, setSelections] = React.useState({
      morning: false,
      afternoon: false,
      notComing: false,
    });

    const handleToggle = (choice: "morning" | "afternoon" | "notComing") => {
      setSelections((prev) => ({
        morning: choice === "morning" ? !prev.morning : prev.morning,
        afternoon: choice === "afternoon" ? !prev.afternoon : prev.afternoon,
        notComing: choice === "notComing" ? !prev.notComing : prev.notComing,
      }));
    };

    return (
      <div className="w-96">
        <PresenceChoices {...args}>
          <PresenceChoices.MorningChoice
            selected={selections.morning}
            onToggle={() => handleToggle("morning")}
          />
          <PresenceChoices.AfternoonChoice
            selected={selections.afternoon}
            onToggle={() => handleToggle("afternoon")}
          />
          <PresenceChoices.NotComingButton
            selected={selections.notComing}
            onToggle={() => handleToggle("notComing")}
          />
        </PresenceChoices>
      </div>
    );
  },
};
