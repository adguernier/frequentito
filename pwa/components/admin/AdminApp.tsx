"use client";

import { HydraAdmin, ListGuesser, ResourceGuesser } from "@api-platform/admin";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";

export function AdminApp() {
  return (
    <HydraAdmin
      requireAuth
      /* @ts-ignore */
      entrypoint={process.env.NEXT_PUBLIC_API_ENTRYPOINT ?? window.origin}
      dataProvider={dataProvider}
      authProvider={authProvider}
    ></HydraAdmin>
  );
}
