"use client";

import React from "react";
import { Checkbox } from "@heroui/checkbox";
import { cn } from "@heroui/theme";
import { kMaxLength } from "buffer";

export default function PeriodCheckbox({ period }: { period?: "am" | "pm" }) {
  const [isSelected, setIsSelected] = React.useState(false);

  return (
    <Checkbox
      radius="full"
      classNames={{
        base: cn(
          "inline-flex w-full max-w-md bg-content1",
          "hover:bg-content2 items-center justify-start",
          "cursor-pointer rounded-lg gap-2 p-4 border-2",
          "data-[selected=true]:border-primary border-default-300"
        ),
        label: "w-full flex justify-center items-center",
      }}
      isSelected={isSelected}
      onValueChange={setIsSelected}
      value={period}
    >
      <div className="w-full flex justify-between gap-2">
        <div className="text-lg">{period}</div>
      </div>
    </Checkbox>
  );
}
