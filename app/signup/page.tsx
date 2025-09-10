"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signup } from "./actions";

type Errors = {
  errors: string[];
  properties?: {
    email?: { errors: string[] };
    password?: { errors: string[] };
    confirmPassword?: { errors: string[] };
  };
};

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  const errors: Errors | undefined =
    state && typeof (state as any).errors !== "string"
      ? ((state as any).errors as Errors)
      : undefined;

  const [dirty, setDirty] = useState(false);
  const handleChange = () => {
    if (!dirty) setDirty(true);
  };

  const emailErrors = errors?.properties?.email?.errors ?? [];
  const passwordErrors = errors?.properties?.password?.errors ?? [];
  const confirmErrors = errors?.properties?.confirmPassword?.errors ?? [];
  const formErrors = errors?.errors ?? [];
  const authError =
    state && typeof (state as any).errors === "string"
      ? ((state as any).errors as string)
      : undefined;
  const success = (state as any)?.success as string | undefined;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <form
        action={action}
        onSubmit={() => setDirty(false)}
        className="w-full max-w-md sm:max-w-lg flex flex-col gap-5"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">Create account</h1>

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
          placeholder="Create a password"
        />
        <Input
          isRequired
          size="lg"
          className="w-full"
          label="Confirm password"
          labelPlacement="outside"
          name="confirmPassword"
          type="password"
          onChange={handleChange}
          isInvalid={!pending && !dirty && confirmErrors.length > 0}
          errorMessage={
            !pending && !dirty ? confirmErrors.join("\n") : undefined
          }
          placeholder="Repeat your password"
        />
        <Button type="submit" size="lg" className="w-full" isDisabled={pending}>
          {pending ? "Creating account…" : "Sign up"}
        </Button>

        <p className="text-center text-sm">
          Already have an account? {" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>

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

        {!pending && success && (
          <div role="status" className="text-sm text-green-600">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}
