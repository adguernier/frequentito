"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset } from "./actions";

type Errors = {
  errors: string[];
  properties?: {
    email?: { errors: string[] };
  };
};

type ResetPasswordState =
  | {
      errors: string;
    }
  | {
      errors: {
        errors: string[];
        properties?: {
          email?: { errors: string[] };
        };
      };
    }
  | {
      success: string;
    }
  | undefined;

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<
    ResetPasswordState,
    FormData
  >(requestPasswordReset, undefined);

  const errors: Errors | undefined =
    state && "errors" in state && typeof state.errors !== "string"
      ? (state.errors as Errors)
      : undefined;

  const [dirty, setDirty] = useState(false);
  const handleChange = () => {
    if (!dirty) setDirty(true);
  };

  const emailErrors = errors?.properties?.email?.errors ?? [];
  const formErrors = errors?.errors ?? [];
  const authError =
    state && "errors" in state && typeof state.errors === "string"
      ? state.errors
      : undefined;
  const success = state && "success" in state ? state.success : undefined;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <form
        action={action}
        onSubmit={() => setDirty(false)}
        className="w-full max-w-md sm:max-w-lg flex flex-col gap-5"
        aria-busy={pending}
      >
        <h1 className="text-2xl font-semibold text-center">Reset password</h1>
        <p className="text-center text-sm text-default-500">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <Input
          isRequired
          size="lg"
          className="w-full"
          label="Email"
          labelPlacement="outside"
          name="email"
          type="email"
          onChange={handleChange}
          isInvalid={!pending && !dirty && emailErrors.length > 0}
          errorMessage={!pending && !dirty ? emailErrors.join("\n") : undefined}
          placeholder="Enter your email"
          isDisabled={!!success}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isDisabled={pending || !!success}
        >
          {pending ? "Sending…" : "Send reset link"}
        </Button>

        <p className="text-center text-sm">
          Remember your password?{" "}
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
          <div
            role="status"
            className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-4 rounded-lg"
          >
            {success}
          </div>
        )}
      </form>
    </div>
  );
}
