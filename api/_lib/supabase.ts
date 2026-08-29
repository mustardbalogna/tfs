import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    // SUPABASE_SECRET_KEY is Supabase's newer name for the service role key.
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase env vars are not configured");
    // Service role/secret key bypasses RLS; only ever used server-side, never sent to the browser.
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
