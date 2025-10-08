"use client";

import React, { createContext, useContext } from "react";
import { Button } from "@heroui/button";

type PresenceChoicesContextValue = {
  disabled: boolean;
};

const PresenceChoicesContext = createContext<PresenceChoicesContextValue>({
  disabled: false,
});

type RootProps = React.PropsWithChildren<{
  disabled?: boolean;
  className?: string;
}>;

const Root = ({ disabled = false, className, children }: RootProps) => {
  return (
    <PresenceChoicesContext.Provider value={{ disabled }}>
      <div
        className={
          "w-full grid grid-cols-1 gap-4 sm:grid-cols-3" +
          (className ? ` ${className}` : "")
        }
      >
        {children}
      </div>
    </PresenceChoicesContext.Provider>
  );
};

type ItemProps = {
  selected: boolean;
  onToggle?: () => void;
  disabled?: boolean;
};

const useDisabled = (override?: boolean) => {
  const ctx = useContext(PresenceChoicesContext);
  return Boolean(override ?? ctx.disabled);
};

const MorningChoice = ({ selected, onToggle, disabled }: ItemProps) => {
  const isDisabled = useDisabled(disabled);
  return (
    <Button
      size="lg"
      className="w-full"
      variant={selected ? "solid" : "flat"}
      color={selected ? "primary" : "default"}
      aria-pressed={selected}
      onPress={onToggle}
      isDisabled={isDisabled}
    >
      In morning
    </Button>
  );
};

const AfternoonChoice = ({ selected, onToggle, disabled }: ItemProps) => {
  const isDisabled = useDisabled(disabled);
  return (
    <Button
      size="lg"
      className="w-full"
      variant={selected ? "solid" : "flat"}
      color={selected ? "primary" : "default"}
      aria-pressed={selected}
      onPress={onToggle}
      isDisabled={isDisabled}
    >
      In afternoon
    </Button>
  );
};

const NotComingChoice = ({ selected, onToggle, disabled }: ItemProps) => {
  const isDisabled = useDisabled(disabled);
  return (
    <Button
      size="lg"
      className="w-full"
      variant={selected ? "solid" : "flat"}
      color={selected ? "danger" : "default"}
      aria-pressed={selected}
      onPress={onToggle}
      isDisabled={isDisabled}
    >
      Not coming
    </Button>
  );
};

type Compound = React.FC<RootProps> & {
  MorningChoice: React.FC<ItemProps>;
  AfternoonChoice: React.FC<ItemProps>;
  NotComingButton: React.FC<ItemProps>;
};

const PresenceChoices = Root as Compound;
PresenceChoices.MorningChoice = MorningChoice;
PresenceChoices.AfternoonChoice = AfternoonChoice;
PresenceChoices.NotComingButton = NotComingChoice;

export default PresenceChoices;
