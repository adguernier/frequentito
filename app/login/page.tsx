"use client";

import { Button } from "@heroui/button";
import { login } from "./actions";
import { Input } from "@heroui/input";
import { useActionState, useState } from "react";

type Errors = {
  errors: string[];
  properties?: {
    email?: { errors: string[] };
    password?: { errors: string[] };
  };
};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  const errors: Errors | undefined =
    state && typeof state.errors !== "string"
      ? (state.errors as Errors)
      : undefined;

  const [dirty, setDirty] = useState(false);
  const handleChange = () => {
    if (!dirty) setDirty(true);
  };

  const emailErrors = errors?.properties?.email?.errors ?? [];
  const passwordErrors = errors?.properties?.password?.errors ?? [];
  const formErrors = errors?.errors ?? [];
  const authError =
    typeof state?.errors === "string" ? state.errors : undefined;
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <form
        action={action}
        onSubmit={() => setDirty(false)}
        className="w-full max-w-md sm:max-w-lg flex flex-col gap-5"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">Frequentito</h1>

        <Input
          isRequired
          size="lg"
          className="w-full"
          label="Email"
          labelPlacement="outside"
          name="email"
          onChange={handleChange}
          isInvalid={!pending && !dirty && emailErrors.length > 0}
          errorMessage={!pending && !dirty ? emailErrors.join("\n") : undefined}
          placeholder="Enter your email"
        />
        <Input
          isRequired
          size="lg"
          className="w-full"
          label="Password"
          labelPlacement="outside"
          name="password"
          type="password"
          onChange={handleChange}
          isInvalid={!pending && !dirty && passwordErrors.length > 0}
          errorMessage={
            !pending && !dirty ? passwordErrors.join("\n") : undefined
          }
          placeholder="Enter your password"
        />
        <Button type="submit" size="lg" className="w-full" isDisabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>

        {!pending && !dirty && (authError || formErrors.length > 0) && (
          <div role="alert" className="text-sm text-red-500">
            {authError && <p>{authError}</p>}
            {formErrors.length > 0 && (
              <ul className="list-disc pl-5">
                {formErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
