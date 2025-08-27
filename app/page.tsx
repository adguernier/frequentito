"use client";

import { Button } from "@heroui/button";
import { useActionState, useState } from "react";
import { upsertPresence } from "./actions";

export default function Home() {
  const [state, action, pending] = useActionState(upsertPresence, undefined);
  const [am, setAm] = useState(false);
  const [pm, setPm] = useState(false);
  const [none, setNone] = useState(false);

  const toggleAm = () => {
    setAm((v) => !v);
    setNone(false);
  };
  const togglePm = () => {
    setPm((v) => !v);
    setNone(false);
  };
  const toggleNone = () => {
    setNone((v) => {
      const next = !v;
      if (next) {
        setAm(false);
        setPm(false);
      }
      return next;
    });
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        action={action}
        className="w-full max-w-md flex flex-col gap-6 items-center"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">
          Today I am coming...
        </h1>

        <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button
            size="lg"
            className="w-full"
            variant={am ? "solid" : "flat"}
            color={am ? "primary" : "default"}
            aria-pressed={am}
            onPress={toggleAm}
          >
            In morning
          </Button>
          <Button
            size="lg"
            className="w-full"
            variant={pm ? "solid" : "flat"}
            color={pm ? "primary" : "default"}
            aria-pressed={pm}
            onPress={togglePm}
          >
            In afternoon
          </Button>
          <Button
            size="lg"
            className="w-full"
            variant={none ? "solid" : "flat"}
            color={none ? "danger" : "default"}
            aria-pressed={none}
            onPress={toggleNone}
          >
            Not coming
          </Button>
        </div>
        {/* Hidden fields to submit state to the server action */}
        <input type="hidden" name="am" value={String(am && !none)} />
        <input type="hidden" name="pm" value={String(pm && !none)} />
        {/* Optional: specify day or note
        <input type="date" name="day" />
        <input type="text" name="note" />
        */}

        <Button
          type="submit"
          size="lg"
          color="primary"
          className="w-full"
          isDisabled={pending}
        >
          {pending ? "Saving…" : "Let's go"}
        </Button>

        {state && "error" in state && state.error && (
          <p className="text-sm text-red-500" role="alert">
            {state.error}
          </p>
        )}
        {state && "ok" in state && state.ok && (
          <p className="text-sm text-success-500">Updated!</p>
        )}
      </form>
    </section>
  );
}
