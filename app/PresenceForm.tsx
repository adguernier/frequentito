"use client";

import { Button } from "@heroui/button";
import PresenceChoices from "@/components/PresenceChoices";
import { useActionState, useEffect, useState } from "react";
import { upsertPresence } from "./actions";
import { useRouter } from "next/navigation";

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
  const [notComing, setNotComing] = useState<boolean>(!initialAm && !initialPm);
  const [locked, setLocked] = useState<boolean>(lockedInitially);
  const router = useRouter();

  useEffect(() => {
    setNotComing(!am && !pm);
  }, [am, pm]);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      setLocked(true);
      // Refresh the page to update the presence list
      router.refresh();
    }
  }, [state, router]);

  const toggleAm = () => {
    setAm((v) => !v);
    setNotComing(false);
  };
  const togglePm = () => {
    setPm((v) => !v);
    setNotComing(false);
  };
  const toggleNone = () => {
    setNotComing((v) => {
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
        <PresenceChoices disabled>
          <PresenceChoices.MorningChoice selected={am} />
          <PresenceChoices.AfternoonChoice selected={pm} />
          <PresenceChoices.NotComingButton selected={notComing} />
        </PresenceChoices>
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

      <PresenceChoices disabled={locked || pending}>
        <PresenceChoices.MorningChoice selected={am} onToggle={toggleAm} />
        <PresenceChoices.AfternoonChoice selected={pm} onToggle={togglePm} />
        <PresenceChoices.NotComingButton
          selected={notComing}
          onToggle={toggleNone}
        />
      </PresenceChoices>
      {/* Hidden fields to submit state to the server action */}
      <input type="hidden" name="am" value={String(am && !notComing)} />
      <input type="hidden" name="pm" value={String(pm && !notComing)} />

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
