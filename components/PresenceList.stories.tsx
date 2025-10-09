import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import PresenceList from "./PresenceList";
import type { PresenceData } from "./PresenceList";

const meta: Meta<typeof PresenceList> = {
  title: "Components/PresenceList",
  component: PresenceList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A component that displays a list of user presences with their morning/afternoon availability and profile information.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    presences: {
      description: "Array of presence data to display",
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading state when true",
    },
    error: {
      control: "text",
      description: "Error message to display when there's an error",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for testing
const mockPresences: PresenceData[] = [
  {
    user_id: "user1",
    am: true,
    pm: false,
    profiles: {
      first_name: "John",
      last_name: "Doe",
      avatar_url:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  },
  {
    user_id: "user2",
    am: false,
    pm: true,
    profiles: {
      first_name: "Jane",
      last_name: "Smith",
      avatar_url:
        "https://images.unsplash.com/photo-1494790108755-2616b45cad1d?w=150&h=150&fit=crop&crop=face",
    },
  },
  {
    user_id: "user3",
    am: true,
    pm: true,
    profiles: {
      first_name: "Mike",
      last_name: "Johnson",
      avatar_url: null,
    },
  },
  {
    user_id: "user4",
    am: true,
    pm: false,
    profiles: {
      first_name: null,
      last_name: "Wilson",
      avatar_url: null,
    },
  },
  {
    user_id: "user5",
    am: false,
    pm: true,
    profiles: null,
  },
  {
    user_id: "user6",
    am: false,
    pm: false,
    profiles: {
      first_name: "Sarah",
      last_name: "Connor",
      avatar_url:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  },
];

// Default story with multiple presences
export const Default: Story = {
  args: {
    presences: mockPresences,
    isLoading: false,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    // Test that presence list renders
    const list = canvas.getByRole("list");
    await expect(list).toBeInTheDocument();

    // Test that user names are displayed
    await expect(canvas.getByText("John Doe")).toBeInTheDocument();
    await expect(canvas.getByText("Jane Smith")).toBeInTheDocument();
    await expect(canvas.getByText("Mike Johnson")).toBeInTheDocument();
    await expect(canvas.getByText("Wilson")).toBeInTheDocument();
    await expect(canvas.getByText("Unnamed teammate")).toBeInTheDocument();
    await expect(canvas.getByText("Sarah Connor")).toBeInTheDocument();

    // Test that AM/PM chips are displayed correctly
    const amChips = canvas.getAllByText("AM");
    const pmChips = canvas.getAllByText("PM");
    const notComingChips = canvas.getAllByText("Not coming");
    await expect(amChips).toHaveLength(3); // John, Mike, Wilson
    await expect(pmChips).toHaveLength(3); // Jane, Mike, Unnamed teammate
    await expect(notComingChips).toHaveLength(1); // Sarah Connor
  },
};

// Story with single presence
export const SinglePresence: Story = {
  args: {
    presences: [mockPresences[0]],
    isLoading: false,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("John Doe")).toBeInTheDocument();
    await expect(canvas.getByText("AM")).toBeInTheDocument();
    await expect(canvas.queryByText("PM")).not.toBeInTheDocument();
  },
};

// Story with both AM and PM presence
export const BothAMAndPM: Story = {
  args: {
    presences: [mockPresences[2]], // Mike Johnson with both AM and PM
    isLoading: false,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Mike Johnson")).toBeInTheDocument();
    await expect(canvas.getByText("AM")).toBeInTheDocument();
    await expect(canvas.getByText("PM")).toBeInTheDocument();
  },
};

// Story with users without avatars
export const NoAvatars: Story = {
  args: {
    presences: mockPresences.map((p) => ({
      ...p,
      profiles: p.profiles ? { ...p.profiles, avatar_url: null } : null,
    })),
    isLoading: false,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    // Test that initials-based avatars are displayed when no avatar URL
    const avatars = canvas.getAllByRole("img");
    await expect(avatars.length).toBeGreaterThan(0);
  },
};

// Story with empty presences
export const EmptyList: Story = {
  args: {
    presences: [],
    isLoading: false,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("No one has shared their presence yet.")
    ).toBeInTheDocument();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};

// Story with loading state
export const Loading: Story = {
  args: {
    presences: [],
    isLoading: true,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Loading presences...")).toBeInTheDocument();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};

// Story with error state
export const ErrorState: Story = {
  args: {
    presences: [],
    isLoading: false,
    error: "Database connection failed",
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Failed to load list.")).toBeInTheDocument();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};

// Story specifically showcasing "not coming" status
export const NotComingUsers: Story = {
  args: {
    presences: [
      {
        user_id: "user1",
        am: true,
        pm: true,
        profiles: {
          first_name: "Alice",
          last_name: "Working",
          avatar_url:
            "https://images.unsplash.com/photo-1494790108755-2616b45cad1d?w=150&h=150&fit=crop&crop=face",
        },
      },
      {
        user_id: "user2",
        am: false,
        pm: false,
        profiles: {
          first_name: "Bob",
          last_name: "Away",
          avatar_url:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
      },
      {
        user_id: "user3",
        am: false,
        pm: false,
        profiles: {
          first_name: "Charlie",
          last_name: "Sick",
          avatar_url: null,
        },
      },
    ],
    isLoading: false,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    // Test that all users are displayed
    await expect(canvas.getByText("Alice Working")).toBeInTheDocument();
    await expect(canvas.getByText("Bob Away")).toBeInTheDocument();
    await expect(canvas.getByText("Charlie Sick")).toBeInTheDocument();

    // Test presence indicators
    await expect(canvas.getByText("AM")).toBeInTheDocument();
    await expect(canvas.getByText("PM")).toBeInTheDocument();

    const notComingChips = canvas.getAllByText("Not coming");
    await expect(notComingChips).toHaveLength(2); // Bob and Charlie
  },
};

// Story testing edge cases with names
export const EdgeCaseNames: Story = {
  args: {
    presences: [
      {
        user_id: "user1",
        am: true,
        pm: false,
        profiles: {
          first_name: "Very Long First Name That Might Overflow",
          last_name: "Very Long Last Name That Might Also Overflow",
          avatar_url: null,
        },
      },
      {
        user_id: "user2",
        am: false,
        pm: true,
        profiles: {
          first_name: "",
          last_name: "",
          avatar_url: null,
        },
      },
      {
        user_id: "user3",
        am: true,
        pm: true,
        profiles: {
          first_name: "Single",
          last_name: null,
          avatar_url: null,
        },
      },
    ],
    isLoading: false,
    error: null,
  },
  render: (args) => (
    <div className="w-96">
      <PresenceList {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(
        "Very Long First Name That Might Overflow Very Long Last Name That Might Also Overflow"
      )
    ).toBeInTheDocument();
    await expect(canvas.getByText("Unnamed teammate")).toBeInTheDocument();
    await expect(canvas.getByText("Single")).toBeInTheDocument();
  },
};
