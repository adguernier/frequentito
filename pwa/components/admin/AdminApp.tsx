"use client";

import { HydraAdmin, ResourceGuesser } from "@api-platform/admin";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { UserList } from "./users/UserList";

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
      <ResourceGuesser name="users" list={UserList} />
      <ResourceGuesser name="greetings" />
    </HydraAdmin>
  );
}