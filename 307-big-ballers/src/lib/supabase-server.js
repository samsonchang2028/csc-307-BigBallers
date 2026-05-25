import { createClient } from "@supabase/supabase-js";

// Server-only client — uses the service role key which bypasses RLS.
// NEVER import this in any 'use client' component or expose it to the browser.
// For browser/auth use, import from @/lib/supabase instead.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
