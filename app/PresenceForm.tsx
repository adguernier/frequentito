"use client";

import { Button } from "@heroui/button";
import { useActionState, useEffect, useState } from "react";
import { upsertPresence } from "./actions";

type PresenceFormProps = {
  initialAm?: boolean;
  initialPm?: boolean;
  lockedInitially?: boolean;
};

export const PresenceForm = ({
  initialAm = false,
  initialPm = false,
  lockedInitially = false,
}: PresenceFormProps) => {
  const [state, action, pending] = useActionState(upsertPresence, undefined);
  const [am, setAm] = useState<boolean>(initialAm);
  const [pm, setPm] = useState<boolean>(initialPm);
  const [none, setNone] = useState<boolean>(!initialAm && !initialPm);
  const [locked, setLocked] = useState<boolean>(lockedInitially);

  useEffect(() => {
    setNone(!am && !pm);
  }, [am, pm]);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      setLocked(true);
    }
  }, [state]);

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
  if (locked) {
    return (
      <div
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
            isDisabled
          >
            In morning
          </Button>
          <Button
            size="lg"
            className="w-full"
            variant={pm ? "solid" : "flat"}
            color={pm ? "primary" : "default"}
            aria-pressed={pm}
            isDisabled
          >
            In afternoon
          </Button>
          <Button
            size="lg"
            className="w-full"
            variant={none ? "solid" : "flat"}
            color={none ? "danger" : "default"}
            aria-pressed={none}
            isDisabled
          >
            Not coming
          </Button>
        </div>
        <Button
          type="button"
          size="lg"
          color="default"
          variant="flat"
          className="w-full"
          isDisabled={pending}
          onPress={() => {
            setLocked(false);
          }}
        >
          Update my presence
        </Button>
      </div>
    );
  }

  return (
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
          isDisabled={locked || pending}
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
          isDisabled={locked || pending}
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
          isDisabled={locked || pending}
        >
          Not coming
        </Button>
      </div>
      {/* Hidden fields to submit state to the server action */}
      <input type="hidden" name="am" value={String(am && !none)} />
      <input type="hidden" name="pm" value={String(pm && !none)} />

      <Button
        type="submit"
        size="lg"
        color="primary"
        className="w-full"
        isDisabled={pending}
      >
        {pending ? "Saving…" : "Save"}
      </Button>

      {state && "error" in state && state.error && (
        <p className="text-sm text-red-500" role="alert">
          {state.error}
        </p>
      )}
      {state && "ok" in state && state.ok && (
        <p className="text-sm text-success-500">Saved!</p>
      )}
    </form>
  );
};
