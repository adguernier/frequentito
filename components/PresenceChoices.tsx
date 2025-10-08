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

type ChoiceProps = ItemProps & {
  label: string;
  selectedColor?: "default" | "primary" | "danger" | "success" | "warning";
};

const Choice = ({
  label,
  selected,
  selectedColor = "primary",
  onToggle,
  disabled,
}: ChoiceProps) => {
  const isDisabled = useDisabled(disabled);
  const color = selected ? selectedColor : "default";
  const variant = selected ? "solid" : ("flat" as const);
  return (
    <Button
      size="lg"
      className="w-full"
      variant={variant}
      color={color}
      aria-pressed={selected}
      onPress={onToggle}
      isDisabled={isDisabled}
    >
      {label}
    </Button>
  );
};

const MorningChoice = (props: ItemProps) => (
  <Choice label="In morning" selectedColor="primary" {...props} />
);

const AfternoonChoice = (props: ItemProps) => (
  <Choice label="In afternoon" selectedColor="primary" {...props} />
);

const NotComingButton = (props: ItemProps) => (
  <Choice label="Not coming" selectedColor="danger" {...props} />
);

type Compound = React.FC<RootProps> & {
  MorningChoice: React.FC<ItemProps>;
  AfternoonChoice: React.FC<ItemProps>;
  NotComingButton: React.FC<ItemProps>;
};

const PresenceChoices = Root as Compound;
PresenceChoices.MorningChoice = MorningChoice;
PresenceChoices.AfternoonChoice = AfternoonChoice;
PresenceChoices.NotComingButton = NotComingButton;

export default PresenceChoices;
