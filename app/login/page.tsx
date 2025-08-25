"use client";

import { Button } from "@heroui/button";
import { login } from "./actions";
import { Input } from "@heroui/input";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      <Input
        isRequired
        label="Email"
        labelPlacement="outside"
        name="email"
        placeholder="Enter your email"
      />
      <Input
        isRequired
        label="Password"
        labelPlacement="outside"
        name="password"
        type="password"
        placeholder="Enter your password"
      />
      <Button type="submit">Log in</Button>
    </form>
  );
}
