"use client";

import { Admin, Resource } from "react-admin";
import { createClient } from "@/utils/supabase/client";

import { supabaseDataProvider } from "ra-supabase";
import { profile } from "./resources/profiles";
import { presence } from "./resources/presences";

const dataProvider = supabaseDataProvider({
  instanceUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseClient: createClient(),
});

export default function AdminApp() {
  return (
    <Admin dataProvider={dataProvider}>
      <Resource {...profile} />
      <Resource {...presence} />
    </Admin>
  );
}
