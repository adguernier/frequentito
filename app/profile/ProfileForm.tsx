"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { updateProfile, type ProfileActionState } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ProfileForm({
  first_name,
  last_name,
}: {
  first_name: string;
  last_name: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProfileActionState,
    FormData
  >(updateProfile, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <section className="h-full w-full flex items-center justify-center px-4 py-8">
      <form
        key={`${first_name}-${last_name}`}
        action={formAction}
        className="w-full max-w-md flex flex-col gap-4"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">Your profile</h1>
        <Input name="first_name" label="First name" defaultValue={first_name} />
        <Input name="last_name" label="Last name" defaultValue={last_name} />
        {state && "error" in state && state.error && (
          <p className="text-sm text-danger-500" role="alert">
            {state.error}
          </p>
        )}
        {state && "ok" in state && state.ok && (
          <p className="text-sm text-success-500">Saved!</p>
        )}
        <Button type="submit" color="primary" isDisabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </form>
    </section>
  );
}
