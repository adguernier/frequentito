"use client";

import { useActionState } from "react";
import { setPassword, type SetPasswordState } from "@/app/actions";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function SetPasswordPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const [state, formAction, pending] = useActionState<SetPasswordState, FormData>(
    setPassword,
    undefined
  );

  return (
    <section className="h-full w-full flex items-center justify-center px-4 py-8">
      <form
        action={formAction}
        className="w-full max-w-md flex flex-col gap-4"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">Set your password</h1>
        <input type="hidden" name="next" value={searchParams?.next ?? "/"} />
        <Input
          name="password"
          type="password"
          label="New password"
          isRequired
          autoComplete="new-password"
        />
        <Input
          name="confirm"
          type="password"
          label="Confirm password"
          isRequired
          autoComplete="new-password"
        />
        {state && "error" in state && state.error && (
          <p className="text-sm text-danger-500" role="alert">{state.error}</p>
        )}
        <Button type="submit" color="primary" isDisabled={pending}>
          {pending ? "Saving…" : "Save password"}
        </Button>
      </form>
    </section>
  );
}
