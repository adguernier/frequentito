import { createClient } from "@supabase/supabase-js";
import "../../../envConfig"; // load local env vars

// Create a Supabase admin client using the service role key
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ROLE_KEY!
);