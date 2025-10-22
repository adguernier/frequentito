"use client";

import { Admin, Resource } from "react-admin";
import { createClient } from "@/utils/supabase/client";

import { supabaseDataProvider } from "ra-supabase";
import { profile } from "./resources/profiles";
import { presence } from "./resources/presences";
import { darkTheme, lightTheme } from "./theme";

const dataProvider = supabaseDataProvider({
  instanceUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseClient: createClient(),
});


export default function AdminApp() {
  return (
    <Admin
      dataProvider={dataProvider}
      theme={darkTheme}
      lightTheme={lightTheme}
    >
      <Resource {...profile} />
      <Resource {...presence} />
    </Admin>
  );
}
