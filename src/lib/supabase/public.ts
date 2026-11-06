import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free client for public reads. Using the session-aware server client
 * would call `cookies()` and force every public page to render dynamically.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
