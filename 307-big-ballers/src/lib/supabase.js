import { createClient } from "@supabase/supabase-js";

// Browser-safe client — uses the anon/public key only.
// NEXT_PUBLIC_SUPABASE_ANON_KEY must be the "anon public" key from the
// Supabase dashboard (Project Settings > API). NEVER put the service_role
// key here — it would be exposed in the browser bundle.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
