"use client";

import { HydraAdmin, ResourceGuesser } from "@api-platform/admin";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";

export function AdminApp() {
  return (
    <HydraAdmin
      requireAuth
      basename="/admin"
      /* @ts-ignore */
      entrypoint={process.env.NEXT_PUBLIC_API_ENTRYPOINT ?? window.origin}
      dataProvider={dataProvider}
      authProvider={authProvider}
    >
      <ResourceGuesser name="users" />
      <ResourceGuesser name="greetings" />
    </HydraAdmin>
  );
}