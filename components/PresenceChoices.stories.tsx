import type { Meta, StoryObj } from "@storybook/react";
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
